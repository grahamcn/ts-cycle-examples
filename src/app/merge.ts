import xs, { Stream } from 'xstream'
import { div, VNode, h2,  } from '@cycle/dom'

interface Sinks {
	DOM: Stream<VNode>,
}

interface Sources {}

function Merge(sources: Sources): Sinks {
	// merging streams of DOMs
	// each new item replaces the previous
	const vdom1$ = xs.of(div('Div 1'))
	const vdom2$ = xs.periodic(3000).mapTo(div('Div 2'))
	const vdom3$ = xs.periodic(6000).mapTo(div('Div 3'))

	const vdom$: Stream<VNode> =
		xs.merge(
			vdom1$,
			vdom2$,
			vdom3$,
		).map(dom =>
		div([
			h2('.header', 'Merge'),
			dom,
		]))

	return {
		DOM: vdom$,
	}
}

export default Merge
