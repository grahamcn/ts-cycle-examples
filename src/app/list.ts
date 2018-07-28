import xs, { Stream } from 'xstream'
import { div, VNode,  } from '@cycle/dom'

interface State { }

interface Sinks {
	DOM: Stream<VNode>,
}

interface Sources {}

function List(sources: Sources): Sinks {
	const vdom$: Stream<VNode> =
		xs.of(
			div('.list', 'list')
		)

	return {
		DOM: vdom$,
	}
}

export default List
