#!/bin/bash

PROJECT_PATH="$(dirname $0)/../"
FILES=$(/bin/bash -c "find {src,test,integration-test,tslint-rules} -follow -name *.ts")

cd $PROJECT_PATH
mkdir -p target/configs

echo Installing in `pwd`

echo Running tsc...
node_modules/.bin/tsc
COMPILATION=$?

echo Running tslint..
node_modules/.bin/tslint --rules-dir target/dist/tslint-rules $FILES
LINTING=$?

echo Copy configuration files...
cp -a configs target/dist/
COPYING_CONFIGS=$?

echo Copy package.json...
cp -a package.json target/dist/
COPYING_PACKAGE=$?

exit $(( $COMPILATION + $LINTING + $COPYING_CONFIGS + $COPYING_PACKAGE ))
