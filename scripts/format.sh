#!/bin/bash

PROJECT_PATH="$(dirname $0)/../"

cd $PROJECT_PATH
echo Formatting project in `pwd`


FORMAT=node_modules/.bin/tsfmt

# TODO fix this up
$FORMAT -r tslint-rules/*.ts \
  src/*.ts src/**/*.ts src/**/**/*.ts \
  test/**/*.ts test/**/**/*.ts \
  integration-test/**/*.ts
