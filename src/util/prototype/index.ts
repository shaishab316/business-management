/* eslint-disable no-unused-vars */
import './string';
import './router';
import './server';

declare global {
  interface Object {
    pipe<T, R>(f: (value: T) => R): R;
  }
}

Object.defineProperty(Object.prototype, 'pipe', {
  value<T, R>(f: (value: T) => R) {
    return f(this.valueOf() as T);
  },
  enumerable: false,
  configurable: true,
});
