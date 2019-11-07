/* Copyright © 2019 Ganchrow Scientific, SA all rights reserved */

/**
 * The LazyMap class provides a Map which is able to create a default value
 * if no value is present and returns it immediately when the get method is call.
 * @class LazyMap
 * @example Example usage:
 * let lm = new LazyMap<string, string>((map, key) => {
 *  return 'defaultValue ' + key;
 * });
 * lm.set('key1', 'value');
 * lm.ensure('key1')
 * // returns 'value'
 * lm.ensure('key2')
 * // returns 'defaultValue key2'
 * // You can also provide the defaultValueFactory for a particular get call.
 * lm.ensure('key2', (map, key) => {
 *  return 'other ' + key;
 * })
 * // returns 'other key2'
*/

export class LazyMap<K, V> extends Map<K, V> {

  constructor(private defaultValueFactory: (map: LazyMap<K, V>, key: K) => V) {
    super();
  }

  public ensure(key: K, defaultValueFactory = this.defaultValueFactory): V {
    if (!this.has(key)) {
      this.set(key, defaultValueFactory(this, key));
    }
    return this.get(key);
  }

}


