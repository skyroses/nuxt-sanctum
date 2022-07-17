import crypto from 'crypto';
import { RouteLocationNormalized } from 'vue-router';

/**
 * Get property defined by dot notation in string.
 * Based on  https://github.com/dy/dotprop (MIT)
 *
 * @param  {Object} holder   Target object where to look property up
 * @param  {string} propName Dot notation, like 'this.a.b.c'
 * @return {*}          A property value
 */
export function getProp (
  holder: Record<string, any>,
  propName?: string | false
): unknown {
  if (!propName || !holder || typeof holder !== 'object') {
    return holder;
  }

  if (propName in holder) {
    return holder[propName];
  }

  const propParts = Array.isArray(propName)
    ? propName
    : (propName + '').split('.');

  let result: any = holder;
  while (propParts.length && result) {
    result = result[propParts.shift()];
  }

  return result;
}

/**
 *
 * @param {RouteLocationNormalized} route
 * @param {string} key
 * @param {any} value
 * @return boolean
 */
export function routeOption (
  route: RouteLocationNormalized,
  key: string,
  value: any
): boolean {
  return route.matched.some((m) => {
    if (value instanceof Array) {
      for (const iter of value) {
        if (m.meta[key] === iter) {
          return true;
        }
      }
    }

    return m.meta[key] === value;
  });
}

/**
 *
 * @param {string} value
 * @return string
 */
export function sha256 (value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex');
}
