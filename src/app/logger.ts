import xs, { Stream } from 'xstream'
import { DOMSource } from '../../node_modules/@cycle/dom'

interface Sinks {
	Log: Stream<string>,
}

interface Sources {
	DOM: DOMSource
}

function Logger(sources: Sources): Sinks {
	const logMe$ = xs.of('log me')

	const linkClick$ =
		sources.DOM
			.select('.link')
			.events('click')
			.map((click: MouseEvent) =>
				click.target['dataset'].dataUrl
			)

	return {
		Log: xs.merge(
			logMe$,
			linkClick$,
		)
	}
}

export default Logger
