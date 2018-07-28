import xs, { Stream } from 'xstream'
import { div, VNode,  } from '@cycle/dom'

interface State { }

interface Sinks {
	DOM: Stream<VNode>,
}

interface Sources {}

function State(sources: Sources): Sinks {
	const vdom$: Stream<VNode> =
		xs.of(
			div('.state', 'state')
		)

	return {
		DOM: vdom$,
	}
}

export default State
