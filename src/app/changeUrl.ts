import xs, { Stream } from 'xstream'
import { div, VNode, DOMSource, h2 } from '@cycle/dom'

interface Sinks {
	DOM: Stream<VNode>,
	History: Stream<string>,
}

interface Sources {
	DOM: DOMSource
}

function ChangeUrl(sources: Sources): Sinks {
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
			.map(i =>
				div([
					h2('.header', 'Change Url'),
					div(`Redirecting in... ${wait - i }`)
				])
			)


	return {
		DOM: vdom$,
		History: url$,
	}
}

export default ChangeUrl
