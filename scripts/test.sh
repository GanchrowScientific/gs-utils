#!/bin/bash

PROJECT_PATH="$(dirname $0)/../"

cd $PROJECT_PATH
echo Running tests in `pwd`
echo

mkdir -p test
mkdir -p test/test-reports

NODEUNIT="node_modules/.bin/nodeunit"
NUOPTS="--reporter junit --output test/test-reports"
TESTDIR="test"

for f in $(find $TESTDIR -type f -name *.test.js);
do
  echo "TEST: $f";
  $NODEUNIT $NUOPTS $f;
  echo "-----";
  echo;
done
