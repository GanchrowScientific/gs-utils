#!/bin/bash
PROJECT_PATH="$(dirname $0)/../"

node "${PROJECT_PATH}target/dist/src/index.js" "$@"
