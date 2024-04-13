#!/usr/bin/env bash

set -exo pipefail

if [ -z "$1" ]
then
  echo "Usage ./migrate-generate.sh description"
  exit 1
fi;

atlas migrate diff "$1" \
  --dir 'file://migrations' \
  --to 'file://schema.sql' \
  --dev-url "sqlite://file?mode=memory&_fk=1" \
  --format '{{ sql . "  " }}'
