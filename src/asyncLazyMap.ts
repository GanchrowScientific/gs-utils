/* Copyright © 2019 Ganchrow Scientific, SA all rights reserved */

/**
 * The AsyncLazyMap class provides a Map which is able to create a default value
 * asynchronously.if no value is present it will return a promise immediately when the get method is call.
 * @class LazyMap
 * @example Example usage:
 * let lm = new AsyncLazyMap<string, string>((map, key) => {
 *  return Promise.resolve('defaultValue ' + key);
 * });
 * lm.set('key1', 'value');
 * await lm.ensure('key1')
 * // returns 'value'
 * await lm.ensure('key2')
 * // returns 'defaultValue key2'
 * // You can also provide the defaultValueFactory for a particular get call.
 * await lm.ensure('key2', (map, key) => {
 *  return Promise.resolve('other ' + key);
 * })
 * // returns 'other key2'
*/
export class AsyncLazyMap<K, V> extends Map<K, V> {

  constructor(private defaultValueFactory: (map: AsyncLazyMap<K, V>, key: K) => Promise<V>) {
    super();
  }

  public async ensure(key: K, defaultValueFactory = this.defaultValueFactory): Promise<V> {
    if (!this.has(key)) {
      this.set(key, await defaultValueFactory(this, key));
    }
    return this.get(key);
  }
}


