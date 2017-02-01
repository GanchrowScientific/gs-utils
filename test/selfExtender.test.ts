/* Copyright © 2017 Ganchrow Scientific, SA all rights reserved */
'use strict';

/// <reference path="../typings/nodeunit/nodeunit.d.ts"/>

// include this line to fix stack traces
import 'source-map-support/register';

import {selfExtender} from '../src/selfExtender';

module.exports = {
  testArrayPropertiesInherited(test: nodeunit.Test) {
    let config = {
        foo: {
          inherits: 'bar',
          array: [1, 2, 3]
        },
        bar: {
          array: [4]
        }
      }
    ;

    let expectConfig = {
      foo: {
        inherits: 'bar',
        array: [1, 2, 3, 4]
      },
      bar: {
        array: [4]
      }
    };

    test.deepEqual(selfExtender(config), expectConfig);

    // also test mutation

    test.deepEqual(config, expectConfig);

    test.done();
  },

  testArrayPropertiesInheritedNotConcat(test: nodeunit.Test) {
    let config = {
        foo: {
          inherits: 'bar',
          array: [1, 2, 3]
        },
        bar: {
          array: [4]
        }
      }
    ;

    let expectConfig = {
      foo: {
        inherits: 'bar',
        array: [4]
      },
      bar: {
        array: [4]
      }
    };

    test.deepEqual(selfExtender(config, null, false), expectConfig);

    // also test mutation

    test.deepEqual(config, expectConfig);

    test.done();
  },

  testInheritsPropertyNotInherited(test: nodeunit.Test) {
    let config = {
        foo: {
          inherits: 'bar',
          array: [1, 2, 3]
        },
        bar: {
          array: [4]
        }
      }
    ;

    let expectConfig = {
      foo: {
        inherits: 'bar',
        array: [1, 2, 3]
      },
      bar: {
        array: [4]
      }
    };
    test.deepEqual(selfExtender(config, ['array']), expectConfig);

    // also test mutation

    test.deepEqual(config, expectConfig);

    test.done();
  },

  testInheritsTargetNotInBlob(test: nodeunit.Test) {
    let config = {
        foo: {
          inherits: 'bar',
          array: [1, 2, 3]
        }
      }
    ;

    let expectConfig = {
      foo: {
        inherits: 'bar',
        array: [1, 2, 3]
      }
    };

    test.deepEqual(selfExtender(config, ['array']), expectConfig);

    // also test mutation

    test.deepEqual(config, expectConfig);

    test.done();
  },

  testNonObjectPropertiesInheritedOrder(test: nodeunit.Test) {
    let config = {
      bar: {
        inherits: ['a', 'b', 'c'],
      },
      foo: {
        inherits: ['a', 'b', 'c'],
      },
      a: {
        fieldA: 10,
        fieldB: 10
      },
      b: {
        fieldB: 12,
        fieldC: 12
      },
      c: {
        fieldC: 14
      }
    };

    let expectConfig = {
      bar: {
        inherits: ['a', 'b', 'c'],
        fieldA: 10,
        fieldB: 10,
        fieldC: 12
      },
      foo: {
        inherits: ['a', 'b', 'c'],
        fieldA: 10,
        fieldB: 10,
        fieldC: 12
      },
      a: {
        fieldA: 10,
        fieldB: 10
      },
      b: {
        fieldB: 12,
        fieldC: 12
      },
      c: {
        fieldC: 14
      }
    };
    test.deepEqual(selfExtender(config), expectConfig);

    // also test mutation

    test.deepEqual(config, expectConfig);
    test.ok(config !== expectConfig);

    test.done();
  },

  testNonObjectPropertiesInherited(test: nodeunit.Test) {
    let config = {
      foo: {
        inherits: ['a', 'b', 'c'],
        fieldA: 5,
        fieldB: 6,
        fieldC: 7
      },
      a: {
        fieldA: 10
      },
      b: {
        fieldB: 12
      },
      c: {
        fieldC: 14
      }
    };

    let expectConfig = {
      foo: {
        inherits: ['a', 'b', 'c'],
        fieldA: 5,
        fieldB: 6,
        fieldC: 7
      },
      a: {
        fieldA: 10
      },
      b: {
        fieldB: 12
      },
      c: {
        fieldC: 14
      }
    };
    test.deepEqual(selfExtender(config), expectConfig);

    // also test mutation

    test.deepEqual(config, expectConfig);

    let nextConfig = {
      foo: {
        inherits: ['a', 'b', 'c'],
      },
      a: {
        fieldA: 10
      },
      b: {
        fieldB: 12
      },
      c: {
        fieldC: 14
      }
    };

    let nextExpectConfig = {
      foo: {
        inherits: ['a', 'b', 'c'],
        fieldA: 10,
        fieldB: 12,
        fieldC: 14
      },
      a: {
        fieldA: 10
      },
      b: {
        fieldB: 12
      },
      c: {
        fieldC: 14
      }
    };
    test.deepEqual(selfExtender(nextConfig), nextExpectConfig);

    // also test mutation

    test.deepEqual(nextConfig, nextExpectConfig);

    test.done();
  },

  testObjectPropertiesInherited(test: nodeunit.Test) {
    let config = {
      foo: {
        inherits: ['a', 'b', 'c'],
        objectA: {
          fieldA: 5, fieldB: 6, fieldC: 7
        }
      },
      a: {
        objectB: { fieldA: 1 }
      },
      b: {
        objectA: {
          fieldD: 8
        }
      },
      c: {
        objectC: {
          fieldC: 14, fieldD: 15, fieldE: 16
        }
      }
    };

    let expectConfig = {
      foo: {
        inherits: ['a', 'b', 'c'],
        objectA: {
          fieldA: 5, fieldB: 6, fieldC: 7, fieldD: 8
        },
        objectB: { fieldA: 1 },
        objectC: {
          fieldC: 14, fieldD: 15, fieldE: 16
        }
      },
      a: {
        objectB: { fieldA: 1 }
      },
      b: {
        objectA: {
          fieldD: 8
        }
      },
      c: {
        objectC: {
          fieldC: 14, fieldD: 15, fieldE: 16
        }
      }
    };

    test.deepEqual(selfExtender(config), expectConfig);

    // also test mutation

    test.deepEqual(config, expectConfig);

    test.done();
  },

  testObjectPropertiesInheritedSpecificInner(test: nodeunit.Test) {
    let config = {
      foo: {
        inherits: ['a', 'b', 'c'],
        objectA: {
          fieldA: 5, fieldB: 6, fieldC: 7
        }
      },
      a: {
        objectB: { fieldA: 1 }
      },
      b: {
        objectA: {
          fieldD: 8
        }
      },
      c: {
        objectC: {
          fieldC: 14, fieldD: 15, fieldE: 16
        },
        inner: {
          array: [1, 2, 3, 4, 5]
        }
      }
    };

    let expectConfig = {
      foo: {
        inherits: ['a', 'b', 'c'],
        objectA: {
          fieldA: 5, fieldB: 6, fieldC: 7
        },
        inner: {
          array: [1, 2, 3, 4, 5]
        }
      },
      a: {
        objectB: { fieldA: 1 }
      },
      b: {
        objectA: {
          fieldD: 8
        }
      },
      c: {
        objectC: {
          fieldC: 14, fieldD: 15, fieldE: 16
        },
        inner: {
          array: [1, 2, 3, 4, 5]
        }
      }
    };

    test.deepEqual(selfExtender(config, null, false, 'inner'), expectConfig);

    // also test mutation

    test.deepEqual(config, expectConfig);

    test.done();
  }
};

