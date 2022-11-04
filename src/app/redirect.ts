import xs, { Stream } from 'xstream'
import { div, VNode, DOMSource, h2 } from '@cycle/dom'

interface Sinks {
	DOM: Stream<VNode>,
	History: Stream<string>,
}

interface Sources {
	DOM: DOMSource
}

// this could be used by any component if adapted, to redirect, with
// duration and message, say, url, as it's sources / state
function Redirect(sources: Sources): Sinks {
	const wait = 3

	const timer$: Stream<number> =
		xs.periodic(1000)
			.map(i => i + 1)
			.startWith(0)

	const url$: Stream<string> =
		timer$
			.filter(i => i === wait)
			.mapTo('/')

	const vdom$: Stream<VNode> =
		timer$
			.map(i => wait - i)
			.map(remainingTime =>
				div([
					h2('.header', 'Redirecting'),
					div(`Redirecting in... ${remainingTime}`)
				])
			)


	return {
		DOM: vdom$,
		History: url$,
	}
}

export default Redirect
