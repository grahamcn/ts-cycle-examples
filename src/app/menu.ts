import { div, VNode } from '../../node_modules/@cycle/dom'
import xs, { Stream } from '../../node_modules/xstream'
import { Location } from 'history'

import { dropRepeats } from './xstream.extra'
import { defaultSecondaryMenuSegment } from './constants'
import { RequestInput } from '../../node_modules/@cycle/http'

interface Sinks {
  DOM: Stream<VNode>,
  HTTP: Stream<RequestInput>
}

interface Sources {
  History: Stream<Location>,
}

function pick(key) {
  return function(o) {
    return o[key]
  }
}

function transformPathToSecondaryDataKey (pathname: string): string {
  return pathname.split('/')[1] || defaultSecondaryMenuSegment
}

function Menu(sources: Sources): Sinks {

  const secondaryDataKey$ =
    sources.History
      .map(pick('pathname'))
      .map(transformPathToSecondaryDataKey)
      .compose(dropRepeats()) // akin to memoize / should component update. aka thought.

  const menuHttp$ =
    secondaryDataKey$.map(key => ({
      url: `https://swapi.co/api/people?${key}`,
      'category': 'secondary-menu'
    }))

  const vdom$ =
    xs.of(div('.menu', 'Menu'))

  return {
    DOM: vdom$,
    HTTP: menuHttp$,
  }
}

export default Menu
