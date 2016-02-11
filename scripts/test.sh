#!/bin/bash

PROJECT_PATH="$(dirname $0)/../"

cd $PROJECT_PATH
echo Running tests in `pwd`
echo

mkdir -p target
mkdir -p target/test-reports

NODEUNIT="node_modules/.bin/nodeunit"
NUOPTS="--reporter junit --output target/test-reports"
TESTDIR="target/dist/test"

for f in $(find $TESTDIR -type f -name *.test.js);
do
  echo "TEST: $f";
  $NODEUNIT $NUOPTS $f;
  echo "-----";
  echo;
done
