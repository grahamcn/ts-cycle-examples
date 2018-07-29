import xs, { Stream } from 'xstream'
import { div, VNode,  } from '@cycle/dom'

interface Sinks {
	DOM: Stream<VNode>,
}

interface Sources {}

function Default(sources: Sources): Sinks {
	const vdom$: Stream<VNode> =
		xs.of(
			div('.default', 'default')
		)

	return {
		DOM: vdom$,
	}
}

export default Default
