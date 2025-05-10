#!/usr/bin/env bash

set -e

export DB_PATH=spdx-dependency-track.empty.db
export LICENSE_GROUPS_DATA_PATH=./data/licenseGroup.json
export LICENSE_DATA_PATH=./data/licenses.json

# NextJS insists on executing modules during the build, so we need to provide it with a working database.
yarn migrate
yarn next build
