import { div, VNode } from '../../node_modules/@cycle/dom'
import xs, { Stream } from '../../node_modules/xstream'

interface Sinks {
  DOM: Stream<VNode>,
}

interface Sources {}

function Menu(sources: Sources): Sinks {
  const vdom$ =
    xs.of(div('.menu', 'Menu'))

  return {
    DOM: vdom$,
  }
}

export default Menu
