#!/bin/bash

PROJECT_PATH="$(dirname $0)/../"

cd $PROJECT_PATH
echo Creating coverage reports for `pwd`

if [ ! -d "target/dist" ]; then
  echo
  echo "target/dist directory not found. Must compile source with \`npm install\` before running tests."
  echo
  exit 1;
fi

COVERAGE_DIR=target/coverage-raw
REMAP_DIR=target/coverage-ts

mkdir -p $COVERAGE_DIR
mkdir -p $REMAP_DIR

# run coverage on unit tests only
echo Creating coverage reports for unit tests
node_modules/.bin/istanbul cover --dir $COVERAGE_DIR nodeunit `find target/dist/test/ -name *.test.js` > /dev/null

# re-map the coverage report so that typescript sources are shown
echo Remapping coverage reports for typescript
node_modules/.bin/remap-istanbul -i $COVERAGE_DIR/coverage.json -o $REMAP_DIR -t html

echo Coverage report located at $REMAP_DIR/index.html