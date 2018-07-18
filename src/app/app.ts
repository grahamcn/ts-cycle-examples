import xs, { Stream } from 'xstream'
import { div, VNode } from '@cycle/dom'

import '../css/styles.css'

interface Sinks {
  DOM: Stream<VNode>
}

function App(): Sinks {
  const vdom$
    = xs.of(div('hello'))

  return {
    DOM: vdom$,
  }
}

export default App
