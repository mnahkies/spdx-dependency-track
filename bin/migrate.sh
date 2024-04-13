#!/usr/bin/env bash

set -eo pipefail

atlas migrate apply \
  --dir 'file://migrations' \
  --url "sqlite://$DB_PATH?_fk=1"
