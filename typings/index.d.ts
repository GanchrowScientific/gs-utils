/// <reference path="custom/bufferpack.d.ts" />
/// <reference path="globals/chalk/index.d.ts" />
/// <reference path="globals/js-yaml/index.d.ts" />
/// <reference path="globals/node/index.d.ts" />
/// <reference path="globals/nodemailer/index.d.ts" />
/// <reference path="globals/nodeunit/index.d.ts" />
/// <reference path="globals/proxyquire/index.d.ts" />
/// <reference path="globals/redis/index.d.ts" />
/// <reference path="globals/sinon/index.d.ts" />

interface Array<T> {
  /**
    * Returns true if searchItem appears as an element of this
    * array, at one or more positions that are
    * greater than or equal to start; otherwise, returns false.
    * @param searchItem the item to search for
    * @param start If start is undefined, 0 is assumed, so as to search all of the Array.
    */
  includes(searchItem: any, start?: number): boolean;
}
