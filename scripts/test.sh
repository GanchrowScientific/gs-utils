#!/bin/bash

PROJECT_PATH="$(dirname $0)/../"

cd $PROJECT_PATH
echo Running tests in `pwd`
echo

mkdir -p target
mkdir -p target/test-reports

echo Copying test resources to target folder
cp -r test/resources target/dist/test/

NODEUNIT="node_modules/.bin/nodeunit"
NUOPTS="--reporter junit --output target/test-reports"
TESTDIR="target/dist/test"
ALL_RESULTS=0
ERROR_MESSAGE=""
FAILURES=0
TEST='test'

runTests() {
  for f in $(find $1 -type f -name '*.test.js');
  do
    echo "TEST: $f";
    $NODE $NODEUNIT $NUOPTS $f;
    RESULT=$?

    TEST_FILE="target/test-reports/`echo $f | sed 's/.*\///'`.xml"
    if [[ ! -s "$TEST_FILE" || "$RESULT" -ne 0 ]]; then
      (( ALL_RESULTS += RESULT ))
      ERROR_MESSAGE+="+ $f\n"
      ((FAILURES++))
    fi

    echo "-----";
    echo;
  done
}

runTests $TESTDIR

if [[ "$FAILURES" -gt 1 ]]; then
  TEST+='s'
fi

if [[ "$FAILURES" -ne 0 ]]; then
  echo -e "\033[31m\033[1m$FAILURES $TEST failed\033[0m"
  echo -e $ERROR_MESSAGE
else
  echo -e "\033[32m\033[1mAll tests passed\033[0m"
fi

exit $ALL_RESULTS
