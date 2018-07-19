import {defaultSecondaryMenuSegment, baseUrl} from './constants'

interface pickKey extends Function {
  (s: Object): string|number|Object // could be others, extend if required
}

// returns a function that will pick the key within the closure from a given object
export function pick(key: string|number): pickKey {
  return function(o: Object): any {
    return o[key] || undefined // not null, see Crockford
  }
}

export function transformPathToSecondaryDataKey (pathname: string): string {
  return pathname.split('/')[1] || defaultSecondaryMenuSegment
}

export function getTertiaryMenuDataUrl(key: string, base: string = baseUrl): string {
  return `${base}/${key}/competitions`
}
