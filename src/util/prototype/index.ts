/* eslint-disable no-unused-vars */
import './string';
import './router';
import './server';
import './array';

declare global {
  interface Object {
    /**
     * This is also known as a method call chain
     * Also known as .pipe();
     */
    __pipes<T>(...fs: ((value: T) => any)[]): T;
  }
}

Object.defineProperty(Object.prototype, '__pipes', {
  async value<T>(...fs: ((value: T) => any)[]) {
    for (const f of fs) await f(this);
    return this;
  },
  enumerable: false,
  configurable: true,
});
