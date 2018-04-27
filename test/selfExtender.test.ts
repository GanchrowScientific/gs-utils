/* Copyright © 2017-2018 Ganchrow Scientific, SA all rights reserved */
'use strict';

// include this line to fix stack traces
import 'source-map-support/register';
import 'jasmine';

import {selfExtender} from '../src/selfExtender';

import {testWrapper} from '../src/jasmineTestWrapper';

const test = testWrapper.init(expect);

describe('SelfExtender', () => {

  it('should inherit array properties', () => {
    let config = {
        foo: {
          inherits: 'bar',
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

    test.deepEqual(selfExtender(config), expectConfig);

    // also test mutation

    test.deepEqual(config, expectConfig);

  });

  it('should inherit array properties and not overwrite', () => {
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

    test.deepEqual(selfExtender(config, null), expectConfig);

    // also test mutation

    test.deepEqual(config, expectConfig);

  });

  it('should not inherit property', () => {
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
  });

  it('should inherit target not in blob', () => {
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

  });

  it('should handle non object properties', () => {
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

  });

  it('should handle non object properties (2)', () => {
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

  });

  it('should handle object properties', () => {
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

  });

  it('should inherit inner object properties', () => {
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

    test.deepEqual(selfExtender(config, null, 'inner'), expectConfig);

    // also test mutation

    test.deepEqual(config, expectConfig);

  });
});

