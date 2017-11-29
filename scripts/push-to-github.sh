#!/bin/bash

PROJECT_PATH="$(dirname $0)/../"

VERSION=$(node ${PROJECT_PATH}scripts/get-version.js $PROJECT_PATH)

echo Creating tag $VERSION
git tag -f $VERSION

echo Pushing to github
git push git@github.com:GanchrowScientific/gs-utils.git master $VERSION
