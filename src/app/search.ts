import xs, { Stream } from 'xstream'
import { div, VNode,  } from '@cycle/dom'

interface Sinks {
	DOM: Stream<VNode>,
}

interface Sources {}

function Search(sources: Sources): Sinks {
	const vdom$: Stream<VNode> =
		xs.of(
			div('.search', 'search')
		)

	return {
		DOM: vdom$,
	}
}

export default Search
