#!/bin/bash

docker run -itd -p 5984:5984 \
    --name TestClouseau \
    -e COUCHDB_USER=admin \
    -e COUCHDB_PASSWORD=password \
    -e COUCHDB_SECRET=secret \
    -e NODENAME=TestClouseau \
    -e COUCHDB_ERLANG_COOKIE=secure_cookie_value \
    --rm \
    zachlankton/couchdb-clouseau:3.3.3.1