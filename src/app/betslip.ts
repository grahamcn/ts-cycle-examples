import { div, VNode } from '@cycle/dom'
import xs, { Stream } from 'xstream'

interface Sinks {
	DOM: Stream<VNode>,
}

interface Sources { }

function Betslip(sources: Sources): Sinks {
	const vdom$ =
		xs.of(div('.betslip', 'Betslip'))

	return {
		DOM: vdom$,
	}
}

export default Betslip
