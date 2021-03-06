import xs, { Stream } from 'xstream'
import { div, VNode,  } from '@cycle/dom'

interface Sinks {
	DOM: Stream<VNode>,
}

interface Sources {}

function FooBar(sources: Sources): Sinks {
	const vdom$: Stream<VNode> =
		xs.of(
			div('.fooBar', 'fooBar')
		)

	return {
		DOM: vdom$,
	}
}

export default FooBar
