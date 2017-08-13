A typescript configuration that can be shared across projects.

# Installation

    npm install -D gs-typescript-config

# Usage

In your `tsconfig.conf` file, add the following entry:

    {
      "extends": "./node_modules/gs-typescript-config/tsconfig.json",
      ...
    }

You can override any option provided by gs-typescript-config by explicitly specifying it in the `tsconfig.conf`.