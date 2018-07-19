import xs, { Stream } from 'xstream'
import { div, VNode } from '@cycle/dom'
import { RequestInput } from '../../node_modules/@cycle/http'

import '../css/styles.css'

interface Sinks {
  DOM: Stream<VNode>,
  HTTP: Stream<RequestInput>,
}

function mapNumberToMessage(i: number): VNode {
	return div(
		`Hello. ${i} seconds ago.`
	)
}

interface AddN extends Function {
	(i: number): number
}

function add(n: number): AddN {
	return function addN(i: number): number {
		return i + n
	}
}

function App(): Sinks {
	const vdom$ =
		xs.periodic(1000)
			.startWith(-1)
			.map(add(1))
      .map(mapNumberToMessage)

  const http$ =
    xs.of({
      category: 'star-wars-poeple',
      url: 'https://swapi.co/api/people',
    })

	return {
    DOM: vdom$,
    HTTP: http$,
	}
}

export default App
