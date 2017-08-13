A [ts-lint](https://github.com/palantir/tslint) configuration that can be shared across projects. This configuration is the one used by Ganchrow Scientific for all of its typescript projects

# Installation

npm install -D gs-ts-int

# Usage

In your `tslint.json` file, add the following entry:

{
  "extends": "gs-ts-lint"
}

You can override any option provided by `gs-ts-lint` by explicitly specifying it in the `tslint.json`.

# Notes

This package includes a custom linting rule that ensures the Ganchrow Scientific copyright file is at the top of all `*.ts` files.