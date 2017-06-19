/* Copyright © 2017 Ganchrow Scientific, SA all rights reserved */
'use strict';

const getDelta = (t, sign = -1) => {
  let hr = process.hrtime();
  return t + sign * (hr[0] * 1e6 + Math.floor(hr[1] / 1e3));
};


export const initialTime = Math.floor(getDelta(Date.now() * 1e3));

export const now = () => {
  return getDelta(initialTime, 1);
};
