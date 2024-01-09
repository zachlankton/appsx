import { FastifyPluginAsync, FastifyRequest } from "fastify";
import jwt from "@tsndr/cloudflare-worker-jwt";

import { FastifyReply } from "fastify/types/reply.js";
import {
  createInviteCode,
  createNewAccountFromInvite,
  createNewAppDatabase,
  generateJWT,
  getDoc,
} from "../lib/couchAdmin.js";
import { getUser } from "../lib/clerkAdmin.js";
import { throwHttpError } from "../lib/utils.js";
const publicKey = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA2pMML5vmkJ1I0jxULKFv
n8jslbq+vXrVoPBD58m/VntJxeJwbDN4530SK0q1PqMybLlmEaQWClbtxkAQsCqc
J7/G02P7xv5qqgiKa6Gw9SYT9K8exW+P0fe/72FxTuFoQ7Y62HVFautoxdd1+A82
3KD0yLiAO81lvrymFw5/7mFXVszpD9jEl2GdbjPqESRI6DRn3dT2QS+8SlqnHM2M
3XfEHcKh//QSBfwK8Nfxt0wghfHyydQqZVhwGaGdUv0ikHXYHPssn1scnodawXhN
7RhTawTTgwRtHYPg/ciT2b/dRQfFQguUe2WRV2WJPLeNpJaelFE7tjUBe6MsCLkS
YQIDAQAB
-----END PUBLIC KEY-----`;

interface SessionPayload {
  exp: number;
  iat: number;
  sub: string;
  iss: string;
  jti: string;
  email: string;
  firstName: string;
  lastName: string;
  image: string;
  hasImage: boolean;
  meta: any;
}

async function getDbInfo(dbName: string) {
  return await getDoc(dbName, `${dbName}_info`, {
    customErrMessage: "Database Document is missing",
    cacheResponseTime: 60 * 1000,
  });
}

async function verifyJwt(request: FastifyRequest, reply: FastifyReply) {
  const token = request.headers?.authorization?.slice(7) || "";
  if (!token) {
    reply.status(401).send({ error: "No token provided" });
    throw new Error("No token provided");
  }

  try {
    const jwtToken = jwt.decode<{}, { alg: string; kid: string }>(token);

    if (!jwtToken) throw new Error("Invalid token");
    if (!jwtToken.header) throw new Error("Invalid token - requires header");
    if (!jwtToken.header.alg)
      throw new Error("Invalid token - requires alg header");
    if (!jwtToken.payload) throw new Error("Invalid token - requires payload");
    if (!jwtToken.payload.exp)
      throw new Error("Invalid token - requires exp claim");
    if (!jwtToken.payload.iat)
      throw new Error("Invalid token - requires iat claim");
    if (!jwtToken.payload.sub)
      throw new Error("Invalid token - requires sub claim");
    if (!jwtToken.payload.iss)
      throw new Error("Invalid token - requires iss claim");
    if (!jwtToken.payload.jti)
      throw new Error("Invalid token - requires jti claim");
    if (!jwtToken.payload.email && !jwtToken.payload.username)
      throw new Error("Invalid token - requires email or username claim");
    if (!jwtToken.payload.meta)
      throw new Error("Invalid token - requires meta claim");

    const { database } = request.params as { database: string };
    const algorithm = jwtToken.header.alg;
    let _publicKey = publicKey;
    if (database) {
      const kid = jwtToken.header.kid;
      const dbInfo = await getDbInfo(database);
      if (dbInfo.trusted_jwt_public_keys[kid]) {
        _publicKey = dbInfo.trusted_jwt_public_keys[kid];
      }
    }

    await jwt.verify(token, _publicKey, { algorithm, throwError: true });
    request.session = jwtToken.payload as SessionPayload;
  } catch (e: any) {
    if (e.message === "EXPIRED") {
      throwHttpError(401, "JWT Token has expired");
    }
    throwHttpError(401, e.message);
  }
}

async function verifyPublicCollectionPermissions(request: FastifyRequest) {
  const method = request.method;
  const { database, collection } = request.params as {
    database: string;
    collection: string;
  };
  if (!database || !collection) {
    throwHttpError(
      400,
      "Error verifying collection permissions: database or collection is not set",
    );
  }

  const publicCollections: any = await getDoc(database, "public_collections", {
    customErrMessage: "Public Collections Document is missing",
    cacheResponseTime: 60 * 1000,
  });

  const collectionPermissions = publicCollections[collection] || {};
  if (collectionPermissions[method] === true) {
    return true;
  }

  throwHttpError(
    403,
    `The operation on this collection is not listed as public`,
  );
}

async function verifyCollectionPermissions(request: FastifyRequest) {
  const method = request.method;
  const { database, collection } = request.params as {
    database: string;
    collection: string;
  };
  if (!database || !collection) {
    throwHttpError(
      400,
      "Error verifying collection permissions: database or collection is not set",
    );
  }
  const databaseObj = request.session?.meta?.databases?.[database];

  if (!databaseObj) {
    throwHttpError(403, "You do not have permission to access this database.");
  }

  const dbInfo: any = await getDbInfo(database);

  const owners = dbInfo.owners || {};
  const owner = owners[request.session!.sub];
  if (owner && owner.email) {
    console.log(
      `Granting access to ${database} because ${owner.email} is owner`,
    );
    return true;
  }

  const userPerms: any = await getDoc(database, request.session!.sub, {
    customErrStatusCode: 403,
    customErrMessage: "User Document is missing",
    cacheResponseTime: 60 * 1000,
  });

  const collections = userPerms.collections || {};
  const collectionPermissions = collections[collection] || {};
  if (collectionPermissions[method] === true) {
    return true;
  }

  throwHttpError(
    403,
    `You do not have permission to ${method} this collection`,
  );
}

async function textOrError(resp: Response) {
  const text = await resp.text().catch((error) => {
    error;
  });
  return text;
}

async function dataOrError(resp: Response) {
  const jsonData = (await resp.json().catch((error) => {
    error;
  })) as any;
  if (jsonData.error) return textOrError(resp);
  return jsonData;
}

function setCors(reply: FastifyReply) {
  reply.header("Access-Control-Allow-Origin", "*");
  reply.header("access-control-max-age", "3600");
  reply.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  reply.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

const root: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.options("*", function (request, reply) {
    setCors(reply);
    reply.header("cache-control", "max-age=3600");
    reply.send();
  });

  fastify.get("/", function (request, reply) {
    reply.send({ hello: "world" });
  });

  fastify.get("/_up", function (request, reply) {
    reply.send();
  });

  fastify.get("/test-db-connection", async function (request, reply) {
    const dbUrl = process.env.DB_URL;
    if (!dbUrl) {
      reply.status(500).send({
        error: "DB_URL is not set",
      });
      return;
    }

    const resp = await fetch(dbUrl);
    const respData = await dataOrError(resp);
    reply.send(respData);
  });

  fastify.get("/test-jwt", async function (request, reply) {
    setCors(reply);
    await verifyJwt(request, reply);
    const jwtToken = await generateJWT(request.session as SessionPayload);
    console.log(request.session);
    reply.send({ ok: true, jwtToken });
  });

  fastify.post("/invite", {
    schema: {},
    handler: async function (request, reply) {
      setCors(reply);
      await verifyJwt(request, reply);
      const user = await getUser(request.session!.sub);
      if (user.public_metadata.appsx_admin !== true) {
        return reply.status(401).send({
          error: "You do not have permission to invite users",
        });
      }

      const inviteCode = await createInviteCode(
        request.session as SessionPayload,
      );
      reply.send({ ...inviteCode });
    },
  });

  fastify.post("/create_new_account/:invite_code", {
    schema: {
      params: {
        type: "object",
        properties: {
          invite_code: {
            type: "string",
            minLength: 29,
            maxLength: 29,
            pattern: "^invite_[a-zA-Z0-9]{22}$",
          },
        },
        required: ["invite_code"],
      },
    },
    handler: async function (request, reply) {
      setCors(reply);
      await verifyJwt(request, reply);
      const user = await getUser(request.session!.sub);
      const acctObj = user.public_metadata.accounts || {};
      const accts = Object.keys(acctObj);

      if (accts.length > 0) {
        reply.status(400).send({
          error: "Accounts already exist",
        });
        return;
      }
      request.session!.meta = user.public_metadata;
      const { invite_code } = request.params as { invite_code: string };
      const response = await createNewAccountFromInvite(
        invite_code,
        request.session as SessionPayload,
      );
      reply.send(response);
    },
  });

  interface CreateDbParams {
    account_name: string;
    db_name: string;
  }

  function validateAccountName(account_name: string) {
    const re = /^acct[a-zA-Z0-9]{16}$/;
    return re.test(account_name);
  }

  fastify.post("/create_database/:account_name/:db_name", {
    schema: {
      params: {
        type: "object",
        properties: {
          account_name: {
            type: "string",
            minLength: 26,
            maxLength: 26,
            pattern: "^acct[a-zA-Z0-9]{22}$",
          },
          db_name: {
            type: "string",
            pattern: "^[a-zA-Z0-9]{1,24}$",
            minLength: 1,
            maxLength: 24,
          },
        },
        required: ["account_name", "db_name"],
      },
    },
    handler: async function (request, reply) {
      setCors(reply);
      await verifyJwt(request, reply);
      const { account_name, db_name } = request.params as CreateDbParams;

      const user = await getUser(request.session!.sub);
      const acctObj = user.public_metadata.accounts || {};

      if (!acctObj[account_name]) {
        reply.status(400).send({
          error:
            "You do no have permission to create a database against this account",
        });
        return;
      }

      request.session!.meta = user.public_metadata;
      const response = await createNewAppDatabase(
        account_name,
        db_name,
        request.session as SessionPayload,
      );

      reply.send(response);
    },
  });

  fastify.get("/:database/:collection", {
    schema: {
      params: {
        type: "object",
        required: ["database", "collection"],
        properties: {
          database: {
            type: "string",
            minLength: 24,
            maxLength: 24,
            pattern: "^db[a-zA-Z0-9]{22}$",
          },
          collection: {
            type: "string",
            minLength: 2,
            maxLength: 25,
            pattern: "^[a-zA-z]{1}[a-zA-Z0-9_]{1,24}$",
          },
          query: {
            type: "object",
            properties: {
              limit: { type: "number", minimum: 1, maximum: 100 },
              skip: { type: "number", minimum: 0 },
              sort: {
                type: "object",
                patternProperties: {
                  "^[a-zA-Z0-9]{1,24}$": { enum: ["asc", "desc"] },
                },
              },
              filter: {
                type: "object",
                patternProperties: {
                  "^[a-zA-Z0-9]{1,24}$": { type: "string" },
                },
              },
            },
          },
        },
      },
    },
    handler: async function (request, reply) {
      setCors(reply);
      const { database, collection } = request.params as {
        database: string;
        collection: string;
      };

      const publicRequest = collection.startsWith("public_");
      if (publicRequest) {
        await verifyPublicCollectionPermissions(request);
      } else {
        await verifyJwt(request, reply);
        await verifyCollectionPermissions(request);
      }

      reply.send({ database, collection });
    },
  });

  fastify.get("/:database/:collection/:docid", async function (request, reply) {
    setCors(reply);
    const { database, collection, docid } = request.params as {
      database: string;
      collection: string;
      docid: string;
    };

    const publicRequest = collection.startsWith("public_");
    if (publicRequest) {
      await verifyPublicCollectionPermissions(request);
    } else {
      await verifyJwt(request, reply);
      await verifyCollectionPermissions(request);
    }

    reply.send({ database, collection, docid });
  });

  fastify.get(
    "/:database/:collection/:id/:filename",
    async function (request, reply) {
      setCors(reply);
      const { database, collection, id, filename } = request.params as {
        database: string;
        collection: string;
        id: string;
        filename: string;
      };

      const publicRequest = collection.startsWith("public_");
      if (publicRequest) {
        await verifyPublicCollectionPermissions(request);
      } else {
        await verifyJwt(request, reply);
        await verifyCollectionPermissions(request);
      }

      reply.send({ database, collection, id, filename });
    },
  );

  fastify.post("/:database/:collection", async function (request, reply) {
    setCors(reply);
    await verifyJwt(request, reply);
    const { database, collection } = request.params as {
      database: string;
      collection: string;
    };
    const { body } = request;
    reply.send({ database, collection, body });
  });

  fastify.put("/:database/:collection/:docid", async function (request, reply) {
    setCors(reply);
    await verifyJwt(request, reply);
    const { database, collection, docid } = request.params as {
      database: string;
      collection: string;
      docid: string;
    };
    const { body } = request;
    reply.send({ database, collection, docid, body });
  });

  fastify.delete(
    "/:database/:collection/:docid",
    async function (request, reply) {
      setCors(reply);
      await verifyJwt(request, reply);
      const { database, collection, docid } = request.params as {
        database: string;
        collection: string;
        docid: string;
      };
      reply.send({ database, collection, docid });
    },
  );

  fastify.put(
    "/:database/:collection/:id/:filename",
    async function (request, reply) {
      setCors(reply);
      await verifyJwt(request, reply);
      const { database, collection, id, filename } = request.params as {
        database: string;
        collection: string;
        id: string;
        filename: string;
      };
      const { body } = request;
      reply.send({ database, collection, id, filename, body });
    },
  );

  fastify.delete(
    "/:database/:collection/:id/:filename",
    async function (request, reply) {
      setCors(reply);
      await verifyJwt(request, reply);
      const { database, collection, id, filename } = request.params as {
        database: string;
        collection: string;
        id: string;
        filename: string;
      };
      reply.send({ database, collection, id, filename });
    },
  );

  fastify.get("/:database/api/:endpoint", async function (request, reply) {
    setCors(reply);
    await verifyJwt(request, reply);
    const { database, endpoint } = request.params as {
      database: string;
      endpoint: string;
    };
    reply.send({ database, endpoint });
  });

  fastify.post("/:database/api/:endpoint", async function (request, reply) {
    setCors(reply);
    await verifyJwt(request, reply);
    const { database, endpoint } = request.params as {
      database: string;
      endpoint: string;
    };
    const { body } = request;
    reply.send({ database, endpoint, body });
  });

  fastify.get(
    "/:database/api-admin/:endpoint",
    async function (request, reply) {
      setCors(reply);
      await verifyJwt(request, reply);
      const { database, endpoint } = request.params as {
        database: string;
        endpoint: string;
      };
      reply.send({ database, endpoint });
    },
  );

  fastify.put(
    "/:database/api-admin/:endpoint",
    async function (request, reply) {
      setCors(reply);
      await verifyJwt(request, reply);
      const { database, endpoint } = request.params as {
        database: string;
        endpoint: string;
      };
      const { body } = request;
      reply.send({ database, endpoint, body });
    },
  );

  fastify.delete(
    "/:database/api-admin/:endpoint",
    async function (request, reply) {
      setCors(reply);
      await verifyJwt(request, reply);
      const { database, endpoint } = request.params as {
        database: string;
        endpoint: string;
      };
      reply.send({ database, endpoint });
    },
  );

  interface CreateDbUserParams {
    account_name: string;
  }

  interface CreateDbUserBody {
    username: string;
    password: string;
    extraData: any;
  }

  fastify.post("/:account_name/user", async function (request, reply) {
    setCors(reply);
    await verifyJwt(request, reply);
    const { account_name } = request.params as CreateDbUserParams;
    const { username, password, extraData } = request.body as CreateDbUserBody;

    console.log({ username, password, extraData });

    if (!account_name && !validateAccountName(account_name)) {
      reply.status(400).send({ error: "account_name is missing or invalid" });
      throw new Error("account_name is required");
    }
    reply.send({ account_name, username, password, extraData });
  });
};

export default root;
