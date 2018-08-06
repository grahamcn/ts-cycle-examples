import { Stream } from 'xstream'
import { div, VNode, DOMSource,  } from '@cycle/dom'

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
			.map((mouseMove: MouseEvent) => div(`{ x: ${mouseMove.x}, y: ${mouseMove.y} }`))
			.startWith(div('Drag over container element to see coordinates'))

	return {
		DOM: vdom$,
	}
}

export default Drag
