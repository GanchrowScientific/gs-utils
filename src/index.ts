/* Copyright © 2015-2016 Ganchrow Scientific, SA all rights reserved */

'use strict';

import * as utils from './utilities';
import * as gsLogger from './gsLogger';
import {Chunker} from './chunker';
import {ByteSizedChunker} from './byteSizedChunker';
import {include} from './decorators/include';
import {classify} from './decorators/classify';
import {lowercaseArguments} from './decorators/lowercaseArguments';
import {precondition} from './decorators/precondition';
import {setOnce} from './decorators/setOnce';
import {Backoff} from './backoff';

export const gsutils = Object.defineProperties(utils, {
  Chunker: { value: Chunker },
  ByteSizedChunker: { value: ByteSizedChunker },
  decorators: { value: Object.defineProperties({}, {
    include: { value: include },
    classify: { value: classify },
    lowercaseArguments: { value: lowercaseArguments },
    setOnce: { value: setOnce },
    precondition: { value: precondition }
  }) },
  Backoff: { value: Backoff },
  gsLogger: { value: gsLogger }
});
