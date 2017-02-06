interface Array<T> {
  /**
    * Returns true if searchItem appears as an element of this
    * array, at one or more positions that are
    * greater than or equal to start; otherwise, returns false.
    * @param searchItem the item to search for
    * @param start If start is undefined, 0 is assumed, so as to search all of the Array.
    */
  includes(searchItem: any, start?: number): boolean;
}
