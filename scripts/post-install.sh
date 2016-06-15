#!/bin/bash

PROJECT_PATH="$(dirname $0)/../"
FILES=$(/bin/bash -c "find {src,test} -follow -name *.ts")

cd $PROJECT_PATH
mkdir -p target/configs

echo Installing in `pwd`

echo Running tsc...
node_modules/.bin/tsc
COMPILATION=$?

echo Patching compilation...
sed -i '1d' target/dist/src/index.d.ts
COMPILATION_PATCHING=$?

echo Running tslint..
node_modules/.bin/tslint --rules-dir target/dist/tslint-rules $FILES
LINTING=$?

echo Copying compiled source to lib folder
mkdir -p lib
cp -r target/dist/src/* lib

exit $(( $COMPILATION + $COMPILATION_PATCHING + $LINTING ))
