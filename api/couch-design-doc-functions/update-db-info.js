function REMOVE_FUNC_NAME_BEFORE_INSERTING_IN_COUCH(doc, req) {
  if (!doc) {
    if ("id" in req && req["id"]) {
      // create new document
      const newDoc = JSON.parse(req["body"]);
      newDoc["_id"] = req["id"];
      newDoc["created_by"] = req["userCtx"]["name"];
      newDoc["created_at"] = new Date().toISOString();

      return [newDoc, "New Doc Created"];
    }
    // change nothing in database
    return [null, "No ID Provided"];
  }
  const updateDoc = JSON.parse(req["body"]);
  updateDoc["_id"] = doc["_id"];
  updateDoc["_rev"] = doc["_rev"];
  updateDoc["created_at"] = doc["created_at"];
  updateDoc["created_by"] = doc["created_by"];
  updateDoc["edited_at"] = new Date().toISOString();
  updateDoc["edited_by"] = req["userCtx"]["name"];
  return [updateDoc, "Edited Doc " + doc["_id"]];
}
