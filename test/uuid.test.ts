/* Copyright © 2025 Ganchrow Scientific, SA all rights reserved */
'use strict';

import 'jasmine';

import { separateDataAndUuid } from '../src/uuid';

describe('uuid', () => {
  it('extract data and uuid', () => {
    let s = '{"data":"testdata","uuid":"1234"}';
    let [data, uuid] = separateDataAndUuid(s);
    expect(data).toBe('testdata');
    expect(uuid).toBe('1234');
  });

  it ('not a json string', () => {
    let s = 'testdata';
    let [data, uuid] = separateDataAndUuid(s);
    expect(data).toBe('testdata');
    expect(uuid).toBe('');
  });

  it ('empty uuid', () => {
    let s = '{"data":"testdata","uuid":""}';
    let [data, uuid] = separateDataAndUuid(s);
    expect(data).toBe('{"data":"testdata","uuid":""}');
    expect(uuid).toBe('');
  });

  it ('no data', () => {
    let s = '{"uuid":"1234"}';
    let [data, uuid] = separateDataAndUuid(s);
    expect(data).toBe('{"uuid":"1234"}');
    expect(uuid).toBe('');
  });

  it ('unexpected attribute', () => {
    let s = '{"data":"testdata","uuid":"1234","unexpected":"unexpected"}';
    let [data, uuid] = separateDataAndUuid(s);
    expect(data).toBe('{"data":"testdata","uuid":"1234","unexpected":"unexpected"}');
    expect(uuid).toBe('');
  });
});
