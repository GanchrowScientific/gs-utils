/* Copyright © 2016 Ganchrow Scientific, SA all rights reserved */
'use strict';

import {Chunker} from './chunker';
import * as utils from './utilities';
import * as gsLogger from './gsLogger';

let ex = new utils.BasicObject();
Object.keys(utils).forEach(utilName => {
  Object.defineProperty(ex, utilName, { value: utils[utilName] });
});

module.exports = Object.defineProperties(ex, {
  Chunker: { value: Chunker },
  gsLogger: { value: gsLogger }
});
