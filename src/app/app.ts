import xs, { Stream } from 'xstream'
import { div, VNode,  } from '@cycle/dom'
import { Reducer } from 'cycle-onionify'

import '../scss/styles.scss'

interface State { }

interface Sinks {
	DOM: Stream<VNode>,
	onion: Stream<Reducer<State>>
}

interface Sources {}

function App(sources: Sources): Sinks {

	const vdom$: Stream<VNode> =
		xs.of(
			div('.container', 'hello')
		)

	return {
		DOM: vdom$,
		onion: xs.never()
	}
}

export default App
