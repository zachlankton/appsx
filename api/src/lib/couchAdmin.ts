import crypto from "crypto";

let dbAdmin = process.env.DB_ADMIN || "";
let dbPassword = process.env.DB_PASSWORD || "";
let dbUrl = process.env.DB_URL;
let Authorization = createBasicAuthHeader(dbAdmin, dbPassword);
let headersList = {
  Authorization,
};

async function dataOrError(resp: Response) {
  const textData = (await resp.text().catch((error) => {
    error;
  })) as any;

  if (textData === undefined || textData === null || textData.error)
    return { error: { textData } };

  try {
    const jsonData = JSON.parse(textData);
    return jsonData;
  } catch (error) {
    return textData;
  }
}

function logAndThrow(error: any, errorMsg: any) {
  console.log(error);
  console.trace();
  throw errorMsg;
}

async function dataOrThrow(response: any, errorMsg: string) {
  if (!response) logAndThrow(response, errorMsg);
  if (!response.ok) logAndThrow(response, errorMsg);
  if (response.error) logAndThrow(response, errorMsg);

  let data = await dataOrError(response);

  if (!data || data.error) logAndThrow(response, errorMsg);
  return data;
}

function createBasicAuthHeader(username: string, password: string) {
  const base64Credentials = btoa(username + ":" + password);
  return "Basic " + base64Credentials;
}

export async function deleteDatabase(dbName: string) {
  const response = await fetch(`${dbUrl}/${dbName}`, {
    method: "DELETE",
    headers: headersList,
  }).catch((error) => {
    error;
  });

  return await dataOrThrow(response, "Could not delete database");
}

export async function createDatabase(dbName: string) {
  const response = await fetch(`${dbUrl}/${dbName}`, {
    method: "PUT",
    headers: headersList,
  }).catch((error) => {
    error;
  });

  console.log({ dbName });
  return await dataOrThrow(response, "Could not create database");
}

export async function createDesignDoc(
  dbName: string,
  docName: string,
  doc: any
) {
  const response = await fetch(`${dbUrl}/${dbName}/_design/${docName}`, {
    method: "PUT",
    headers: headersList,
    body: JSON.stringify(doc),
  }).catch((error) => {
    error;
  });

  return await dataOrThrow(response, "Could not create design doc");
}

export async function upsert(dbName: string, docid: string, doc: any) {
  const response = await fetch(
    `${dbUrl}/${dbName}/_design/update_doc/_update/updatefun1/${docid}`,
    {
      method: "PUT",
      body: JSON.stringify(doc),
      headers: headersList,
    }
  ).catch((error) => {
    error;
  });

  return await dataOrThrow(response, "Could not create database info doc");
}

export async function getDoc(dbName: string, docid: string) {
  const response = await fetch(`${dbUrl}/${dbName}/${docid}`, {
    method: "GET",
    headers: headersList,
  }).catch((error) => {
    error;
  });

  return await dataOrThrow(response, "Could not get doc");
}

export async function updatePerms(dbName: string) {
  const perms = {
    members: {
      roles: ["_admin", `${dbName}_user`],
    },
    admins: {
      roles: ["_admin", `${dbName}_admin`],
    },
  };

  const response = await fetch(`${dbUrl}/${dbName}/_security`, {
    method: "PUT",
    headers: headersList,
    body: JSON.stringify(perms),
  }).catch((error) => {
    error;
  });

  return await dataOrThrow(response, "Could not update permissions");
}

type DbOwner = {
  firstName: string;
  lastName: string;
  email: string;
  id: string;
};

export async function createNewAppDatabase(dbName: string, owner: DbOwner) {
  const newDbId = "db" + crypto.randomUUID().replaceAll("-", "");

  const updateDoc = {
    updates: {
      updatefun1:
        'function (doc, req) {\n  if (!doc) {\n    if ("id" in req && req["id"]) {\n      // create new document\n      const newDoc = JSON.parse(req["body"]);\n      newDoc["_id"] = req["id"];\n      newDoc["created_by"] = req["userCtx"]["name"];\n      newDoc["created_at"] = new Date().toISOString();\n\n      return [newDoc, "New Doc Created"];\n    }\n    // change nothing in database\n    return [null, "No ID Provided"];\n  }\n  const updateDoc = JSON.parse(req["body"]);\n  updateDoc["_id"] = doc["_id"];\n  updateDoc["_rev"] = doc["_rev"];\n  updateDoc["created_at"] = doc["created_at"];\n  updateDoc["created_by"] = doc["created_by"];\n  updateDoc["edited_at"] = new Date().toISOString();\n  updateDoc["edited_by"] = req["userCtx"]["name"];\n  return [updateDoc, "Edited Doc " + doc["_id"]];\n}\n',
    },
    language: "javascript",
  };

  const appDbInfo: any = {
    displayName: dbName,
    owners: {},
    trusted_jwt_public_keys: {
      ins_2a8gd9mK84nMQ42iI1r4nt4bpGA: `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA2pMML5vmkJ1I0jxULKFv
n8jslbq+vXrVoPBD58m/VntJxeJwbDN4530SK0q1PqMybLlmEaQWClbtxkAQsCqc
J7/G02P7xv5qqgiKa6Gw9SYT9K8exW+P0fe/72FxTuFoQ7Y62HVFautoxdd1+A82
3KD0yLiAO81lvrymFw5/7mFXVszpD9jEl2GdbjPqESRI6DRn3dT2QS+8SlqnHM2M
3XfEHcKh//QSBfwK8Nfxt0wghfHyydQqZVhwGaGdUv0ikHXYHPssn1scnodawXhN
7RhTawTTgwRtHYPg/ciT2b/dRQfFQguUe2WRV2WJPLeNpJaelFE7tjUBe6MsCLkS
YQIDAQAB
-----END PUBLIC KEY-----`,
    },
  };

  appDbInfo.owners[owner.id] = {
    firstName: owner.firstName,
    lastName: owner.lastName,
    email: owner.email,
  };

  await createDatabase(newDbId);
  console.log(newDbId, "Database created");

  await updatePerms(newDbId);
  console.log(newDbId, "Database permissions updated");

  await createDesignDoc(newDbId, "update_doc", updateDoc);
  console.log(newDbId, "Update Design doc created");

  await upsert(newDbId, `${newDbId}_info`, appDbInfo);
  console.log(newDbId, "Database info doc created");
}