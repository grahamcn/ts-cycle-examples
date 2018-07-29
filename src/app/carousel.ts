import xs, { Stream } from 'xstream'
import { div, VNode,  } from '@cycle/dom'

interface Sinks {
	DOM: Stream<VNode>,
}

interface Sources {}

function Carousel(sources: Sources): Sinks {
	const vdom$: Stream<VNode> =
		xs.of(
			div('.carousel', 'carousel')
		)

	return {
		DOM: vdom$,
	}
}

export default Carousel
