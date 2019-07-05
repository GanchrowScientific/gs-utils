/* Copyright © 2019 Ganchrow Scientific, SA all rights reserved */

export default function stripControlCharacters(str: string) {
  if (typeof str !== 'string') {
    return str;
  }

  str = str.trim();
  let len = str.length;
  let buf = [];
  for (let cnt = 0; cnt < len; cnt++) {
    let code = str.charCodeAt(cnt);

    if ((code > 0x1F && code < 0x7F) || code === 0x09 || code === 0x0A || code > 0x9F) {
      buf.push(str[cnt]);
    }
  }

  return buf.join('');
}
