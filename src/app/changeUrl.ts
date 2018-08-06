import xs, { Stream } from 'xstream'
import { div, VNode, DOMSource, map, h2,  } from '@cycle/dom'

interface Sinks {
	DOM: Stream<VNode>,
	History: Stream<string>,
}

interface Sources {
	DOM: DOMSource
}

function ChangeUrl(sources: Sources): Sinks {
	const wait = 5
	const timer$: Stream<number> =
		xs.periodic(1000).startWith(-1)

	const url$: Stream<string> =
		timer$
			.filter(i => i + 1 === wait)
			.mapTo('/')

	const vdom$: Stream<VNode> =
		timer$
			.map(i =>
				div([
					h2('.header', 'Change Url'),
					div(`Redirecting in... ${wait - (i + 1) }`)
				])
			)


	return {
		DOM: vdom$,
		History: url$,
	}
}

export default ChangeUrl
