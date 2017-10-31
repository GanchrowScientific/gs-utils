/* Copyright © 2017 Ganchrow Scientific, SA all rights reserved */
'use strict';

// include this line to fix stack traces
import 'source-map-support/register';

import * as nodeunit from 'nodeunit';
import * as sinon from 'sinon';
import * as pq from 'proxyquire';

import {dup} from '../src/utilities';

const proxyquire = pq.noPreserveCache();
const files = ['foo.test', 'bar.test', 'test.bar', 'a.yaml', 'b.yaml'];

let readdirSyncStub: sinon.SinonStub;
let readFileSyncStub: sinon.SinonStub;

module.exports = {
  testReturnAllFileContents(test: nodeunit.Test) {
    test.deepEqual(loadFilesIntoArray('hey'), files.map(file => `${file} content ...`));
    test.done();
  },

  testReturnSomeFileContents(test: nodeunit.Test) {
    test.deepEqual(
      loadFilesIntoArray('hey', /\.yaml$/),
      ['a.yaml', 'b.yaml'].map(file => `${file} content ...`)
    );
    test.deepEqual(
      loadFilesIntoArray('hey', /test/),
      ['foo.test', 'bar.test', 'test.bar'].map(file => `${file} content ...`)
    );
    test.deepEqual(
      loadFilesIntoArray('hey', /^test/),
      ['test.bar'].map(file => `${file} content ...`)
    );
    test.done();
  }
};

function loadFilesIntoArray(dir: string, type?: RegExp) {
  readdirSyncStub = sinon.stub().returns(dup(files));
  readFileSyncStub = sinon.stub();
  files.forEach(file => {
    readFileSyncStub.withArgs(`${dir}/${file}`).returns(`${file} content ...`);
  });
  return proxyquire('../src/loadFilesIntoArray', {
    fs: {
     readdirSync: readdirSyncStub,
     readFileSync: readFileSyncStub
    }
  }).loadFilesIntoArray(dir, type);
}
