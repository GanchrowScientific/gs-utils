#!/bin/bash

PROJECT_PATH="$(dirname $0)/../"

cd $PROJECT_PATH
echo Packaging project in `pwd`

mkdir -p target/work
cp -r target/dist/src target/dist/configs target/dist/package.json target/work
mv target/work/src target/work/lib
mkdir -p target/archive
cd target/work
npm install --production
zip -rq ../archive/feed-aggregator.zip .
cd ../../
rm -r target/work
