#!/bin/bash

PROJECT_PATH="$(dirname $0)/../"
FILES=$(/bin/bash -c "find {src,test} -follow -name *.ts")

cd $PROJECT_PATH
mkdir -p target/configs

echo Installing in `pwd`

echo Running tsc...
node_modules/.bin/tsc
COMPILATION=$?

echo Running tslint..
node_modules/.bin/tslint $FILES
LINTING=$?

echo Copying compiled source to lib folder
mkdir -p lib
cp -r target/dist/src/* lib

echo Fixing the source maps
SOURCE_MAPS=0
for f in $(find ./lib/ -type f -name '*.js.map');
do
  sed -i -e s_\\.\\./\\.\\./__ $f
  (( SOURCE_MAPS += $? ))
done

exit $(( $COMPILATION + $COMPILATION_PATCHING + $LINTING + $SOURCE_MAPS))
