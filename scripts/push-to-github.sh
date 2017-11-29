#!/bin/bash

PROJECT_PATH="$(dirname $0)/../"

VERSION=$(${PROJECT_PATH}scripts/get-package-property $PROJECT_PATH version)
PROJECT_NAME=$(${PROJECT_PATH}scripts/get-package-property $PROJECT_PATH name)

echo Creating tag $VERSION
git tag -f $VERSION

echo Pushing to github
git push -f git@github.com:GanchrowScientific/${PROJECT_NAME}.git +HEAD:master $VERSION
