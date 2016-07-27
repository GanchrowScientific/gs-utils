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
OS=$(uname)
case $OS in
  'Linux')
    sed -i '1d' target/dist/src/index.d.ts
    ;;
  'Darwin')
    sed -i.tmp '1d' target/dist/src/index.d.ts
    rm -f target/dist/src/index.d.ts.tmp
    ;;
  *);;
esac
COMPILATION_PATCHING=$?

echo Running tslint..
node_modules/.bin/tslint $FILES
LINTING=$?

echo Copying compiled source to lib folder
mkdir -p lib
cp -r target/dist/src/* lib

exit $(( $COMPILATION + $COMPILATION_PATCHING + $LINTING ))
