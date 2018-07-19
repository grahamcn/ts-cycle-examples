import { div, VNode } from '../../node_modules/@cycle/dom'
import xs, { Stream } from '../../node_modules/xstream'

interface Sinks {
  DOM: Stream<VNode>,
}

interface Sources {}

function Sport(sources: Sources): Sinks {
  const vdom$ =
    xs.of(div('.sport', 'Sport'))

  return {
    DOM: vdom$,
  }
}

export default Sport
