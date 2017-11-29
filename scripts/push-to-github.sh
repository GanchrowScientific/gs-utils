#!/bin/bash

PROJECT_PATH="$(dirname $0)/../"

VERSION=$(${PROJECT_PATH}scripts/get-version $PROJECT_PATH)

echo Creating tag $VERSION
git tag -f $VERSION

echo Pushing to github
git push git@github.com:GanchrowScientific/gs-utils.git master $VERSION
