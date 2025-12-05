#!/usr/bin/env bash

set -eo pipefail

export DB_PATH="$PWD/spdx-dependency-track.db"

pnpm i
pnpm run migrate
pnpm run package

docker run --rm -it -p 3000:3000 \
  -e DB_PATH=/opt/data/spdx-dependency-track.db \
  -v "$DB_PATH":/opt/data/spdx-dependency-track.db \
  spdx-dependency-track
