import { FastifyPluginAsync, FastifyRequest } from "fastify";
import jwt from "@tsndr/cloudflare-worker-jwt";

import { FastifyReply } from "fastify/types/reply.js";
import { createNewAccount, createNewAppDatabase } from "../lib/couchAdmin.js";
import { getUser } from "../lib/clerkAdmin.js";
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

async function verifyJwt(request: FastifyRequest, reply: FastifyReply) {
  const token = request.headers?.authorization?.slice(7) || "";
  if (!token) {
    reply.status(401).send({ error: "No token provided" });
    throw new Error("No token provided");
  }
  try {
    const jwtToken = jwt.decode<{}, { alg: string }>(token);

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
    if (!jwtToken.payload.email)
      throw new Error("Invalid token - requires email claim");
    if (!jwtToken.payload.firstName)
      throw new Error("Invalid token - requires firstName claim");
    if (!jwtToken.payload.lastName)
      throw new Error("Invalid token - requires lastName claim");
    if (!jwtToken.payload.meta)
      throw new Error("Invalid token - requires meta claim");
    if (!jwtToken.payload.image)
      throw new Error("Invalid token - requires image claim");
    if (!jwtToken.payload.hasImage)
      throw new Error("Invalid token - requires hasImage claim");

    const algorithm = jwtToken.header.alg;
    await jwt.verify(token, publicKey, { algorithm, throwError: true });
    request.session = jwtToken.payload as SessionPayload;
  } catch (e: any) {
    console.log(e);
    reply.status(401).send({ error: e.message });
    throw new Error(e.message);
  }
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
    console.log(request.session);
    reply.send({ ok: true });
  });

  fastify.post("/create_new_account", async function (request, reply) {
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
    const response = await createNewAccount(request.session);
    reply.send(response);
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
            minLength: 20,
            maxLength: 20,
            pattern: "^acct[a-zA-Z0-9]{16}$",
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
        request.session
      );

      reply.send(response);
    },
  });

  interface CreateDbUserParams {
    account_name: string;
  }

  interface CreateDbUserBody {
    username: string;
    password: string;
    extraData: any;
  }

  fastify.post("/user/:account_name", async function (request, reply) {
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
