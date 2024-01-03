// Read the .env file.
import { log } from "console";
import * as dotenv from "dotenv";
dotenv.config();

let dbAdmin = process.env.DB_ADMIN;
let dbPassword = process.env.DB_PASSWORD;
let dbUrl = process.env.DB_URL;
let Authorization = createBasicAuthHeader(dbAdmin, dbPassword);
let headersList = {
  Authorization,
};

async function textOrError(resp) {
  const text = await resp.text().catch((error) => {
    error;
  });
  return text;
}

async function dataOrError(resp) {
  const textData = await resp.text().catch((error) => {
    error;
  });

  if (textData === undefined || textData === null || textData.error)
    return { error: { textData } };

  try {
    const jsonData = JSON.parse(textData);
    return jsonData;
  } catch (error) {
    return textData;
  }
}

function logAndThrow(error, errorMsg) {
  console.log(error);
  console.trace();
  throw errorMsg;
}

async function dataOrThrow(response, errorMsg) {
  if (!response.ok) logAndThrow(response, errorMsg);
  if (response.error) logAndThrow(response, errorMsg);

  let data = await dataOrError(response);

  if (!data || data.error) logAndThrow(response, errorMsg);
  return data;
}

function createBasicAuthHeader(username, password) {
  const base64Credentials = btoa(username + ":" + password);
  return "Basic " + base64Credentials;
}

async function deleteDatabase(dbName) {
  const response = await fetch(`${dbUrl}/${dbName}`, {
    method: "DELETE",
    headers: headersList,
  }).catch((error) => {
    error;
  });

  return; //await dataOrThrow(response, "Could not delete database");
}

async function createDatabase(dbName) {
  const response = await fetch(`${dbUrl}/${dbName}`, {
    method: "PUT",
    headers: headersList,
  }).catch((error) => {
    error;
  });

  return await dataOrThrow(response, "Could not create database");
}

async function createDesignDoc(dbName, docName, doc) {
  const response = await fetch(`${dbUrl}/${dbName}/_design/${docName}`, {
    method: "PUT",
    headers: headersList,
    body: JSON.stringify(doc),
  }).catch((error) => {
    error;
  });

  return await dataOrThrow(response, "Could not create design doc");
}

async function upsert(dbName, docid, doc) {
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

async function updatePerms(dbName) {
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

const updateDoc = {
  updates: {
    updatefun1:
      'function (doc, req) {\n  if (!doc) {\n    if ("id" in req && req["id"]) {\n      // create new document\n      const newDoc = JSON.parse(req["body"]);\n      newDoc["_id"] = req["id"];\n      newDoc["created_by"] = req["userCtx"]["name"];\n      newDoc["created_at"] = new Date().toISOString();\n\n      return [newDoc, "New Doc Created"];\n    }\n    // change nothing in database\n    return [null, "No ID Provided"];\n  }\n  const updateDoc = JSON.parse(req["body"]);\n  updateDoc["_id"] = doc["_id"];\n  updateDoc["_rev"] = doc["_rev"];\n  updateDoc["created_at"] = doc["created_at"];\n  updateDoc["created_by"] = doc["created_by"];\n  updateDoc["edited_at"] = new Date().toISOString();\n  updateDoc["edited_by"] = req["userCtx"]["name"];\n  return [updateDoc, "Edited Doc " + doc["_id"]];\n}\n',
  },
  language: "javascript",
};

const appDbInfo = {
  display_name: "AppsX Dev",
  owners: {
    user_2a8yQermtejIHexipyim79bXWeT: {
      firstName: "Zach",
      lastName: "Lankton",
      email: "zach@zachwritescode.com",
    },
  },
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

async function seed() {
  await deleteDatabase("appsx_dev");
  console.log("Database deleted");

  await createDatabase("appsx_dev");
  console.log("Database created");

  await createDesignDoc("appsx_dev", "update_doc", updateDoc);
  console.log("Update Design doc created");

  await upsert("appsx_dev", "appsx_dev_info", appDbInfo);
  console.log("Database info doc created");

  await updatePerms("appsx_dev");
  console.log("Database permissions updated");
}

seed();
