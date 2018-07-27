import { div, VNode, h3, span, select } from '@cycle/dom'
import xs, { Stream } from 'xstream'

interface Sinks {
	DOM: Stream<VNode>,
}

interface Sources { }

interface Selection {
	price: string
	outcome: string
	market: string
	startTime: string
	classes: string[]
}

function Betslip(sources: Sources): Sinks {

	const selections$: Stream<Selection[]> =
		xs.from([[{
			price: '1.23',
			outcome: 'Arsenal',
			market: '1X2 - Arsenal - Manchester City',
			startTime: '11/08/2018 ore 16:00',
			classes: ['.price', '.price--clicked'],
		}, {
			price: '1.75',
			outcome: 'Under 2.5',
			market: 'Under / Over - Bournemouth - Cardiff City',
			startTime: '11/08/2018 ore 16:00',
			classes: ['.price', '.price--clicked', '.price--updated'],
		}, {
			price: 'Sosp',
			outcome: 'Crystal Palce',
			market: '1X2 - Fulham - Crystal Palace',
			startTime: '12/08/2018 ore 16:00',
			classes: ['.price'],
		}]])

	const vdom$: Stream<VNode> =
		selections$.map(selections =>
			div('.betslip', [ // list
				h3('.betslip__title', [
					span('.betslip__count', 3),
					'Bet Slip'
				]),
				div('.betslip__selections',
					selections.map((selection: Selection) =>
						div('.selection', [
							div(
								div(selection.classes.join(' '),
									selection.price,
								),
							),
							div('.selection__details', [
								div('.selection__outcome', selection.outcome),
								div('.selection__market', selection.market),
								div('.selection__startTime', selection.startTime),
							]),
							div('.selection__remove', 'x')
						])
					)
				)
			])
		)

	return {
		DOM: vdom$,
	}
}

export default Betslip
