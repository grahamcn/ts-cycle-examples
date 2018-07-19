import { div, VNode } from '@cycle/dom'
import xs, { Stream } from 'xstream'

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
