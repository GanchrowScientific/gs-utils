#!/bin/bash
exit 0
PROJECT_PATH="$(dirname $0)/../"
FILES=$(/bin/bash -c "find {src,test} -follow -name *.ts")

cd $PROJECT_PATH

echo Installing in `pwd`

echo Running tsc...
node_modules/.bin/tsc
COMPILATION=$?

echo Running tslint..
node_modules/.bin/tslint $FILES
LINTING=$?

echo Copy package.json...
cp -a package.json target/dist/
COPYING_PACKAGE=$?

echo Copy README...
cp -a README.md target/dist/
COPYING_README=$?

exit $(( $COMPILATION + $LINTING + $COPYING_PACKAGE + $COPYING_README ))
