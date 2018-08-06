import xs, { Stream } from 'xstream'
import { div, VNode,  } from '@cycle/dom'

interface Sinks {
	DOM: Stream<VNode>,
}

interface Sources {}

function Combine(sources: Sources): Sinks {
	// combining two streams of DOMs
	// all dom streams must emit before the xs.combine will emit
	const vdom1$ = xs.of(div('Div 1'))
	const vdom2$ = xs.of(div('Div 2'))

	// this will cause a 5s delay before render (of the entire vdom)
	// const vdom2$ =
	//   xs.periodic(5000).mapTo(div('Div 2'))

	// this is commonly addressed like so (whether here or in the parent listening to our vdom stream):
	// const vdom2$ =
	// 	xs.periodic(5000)
	// 		.mapTo(div('Div 2'))
	// 		.startWith(undefined)

	const vdom$: Stream<VNode> =
		xs.combine(
			vdom1$,
			vdom2$,
		).map(([vdom1, vdom2]) =>
			div([
				vdom1,
				vdom2,
			])
		)

	return {
		DOM: vdom$,
	}
}

export default Combine
