import { Stream } from 'xstream'
import { div, VNode, DOMSource, h2, p, } from '@cycle/dom'

interface Sinks {
	DOM: Stream<VNode>,
}

interface Sources {
	DOM: DOMSource
}

function Drag(sources: Sources): Sinks {
	const mouseUp$: Stream<MouseEvent> = sources.DOM.select('.container').events('mouseup')
	const mouseDown$: Stream<MouseEvent> = sources.DOM.select('.container').events('mousedown')
	const mouseMove$: Stream<MouseEvent> = sources.DOM.select('.container').events('mousemove')

	const drags$: Stream<MouseEvent> =
		mouseDown$
			.map(() => mouseMove$.endWhen(mouseUp$))
			.flatten()

	const vdom$: Stream<VNode> =
		drags$
			.map((mouseMove: MouseEvent) =>
        div(`{ x: ${mouseMove.x}, y: ${mouseMove.y} }`)
      )
			.startWith(undefined)
			.map(dom =>
				div([
					h2('.header', 'Drag'),
					p('Drag over container element to see coordinates'),
					dom,
				])
			)

	return {
		DOM: vdom$,
	}
}

export default Drag
