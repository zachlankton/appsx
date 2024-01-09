#!/bin/bash
set -e

docker run -itd -p 5984:5984 \
    --name TestClouseau \
    -e COUCHDB_USER=admin \
    -e COUCHDB_PASSWORD=password \
    -e COUCHDB_SECRET=secret \
    -e NODENAME=TestClouseau \
    -e COUCHDB_ERLANG_COOKIE=secure_cookie_value \
    --rm \
    zachlankton/couchdb-clouseau:3.3.3.1

echo "Waiting for CouchDB to start up..."
sleep 5

echo "Seeding Database..."
node seed.js

echo "Waiting for CouchDB to finish seeding..."
sleep 5

echo "Restarting CouchDB Container..."
docker restart TestClouseau
