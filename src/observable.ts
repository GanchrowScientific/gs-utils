/* Copyright © 2022 Ganchrow Scientific, SA all rights reserved */

import { Observable } from 'rxjs';

export function toPromise<T>(o: Observable<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    o.subscribe(r => resolve(r), e => reject(e));
  });
}
