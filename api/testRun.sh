#!/bin/bash

docker run -itd --rm --name "Appsx-API" -p 3000:3000 zachlankton/appsx-api:$1