import xs, { Stream } from 'xstream'
import { div, VNode, DOMSource } from '@cycle/dom'
import { RequestInput, HTTPSource } from '@cycle/http'
import { Location } from '@cycle/history'
import { StateSource, Reducer } from 'cycle-onionify'

import '../css/styles.css'

import Menu from './menu'
import Sport from './sport'
import Betslip from './betslip'
import ContainerMenu from './containerMenu'

interface State { }

interface Sinks {
	DOM: Stream<VNode>,
	HTTP: Stream<RequestInput>,
	onion: Stream<Reducer<State>>,
	History: Stream<string>
}

interface Sources {
	DOM: DOMSource,
	HTTP: HTTPSource,
	History: Stream<Location>,
	onion: StateSource<State>,
}

function App(sources: Sources): Sinks {

	const containerMenuSinks = ContainerMenu(sources)
	const menuSinks = Menu(sources)
	const sportSinks = Sport(sources)
	const betslipSinks = Betslip(sources)

	const containerMenuDom$ = containerMenuSinks.DOM
	const containerMenuHistory$ = containerMenuSinks.History

	const menuDom$: Stream<VNode> = menuSinks.DOM
	const menuHttp$: Stream<RequestInput> = menuSinks.HTTP

	const sportDom$: Stream<VNode> = sportSinks.DOM
	const sportHttp$: Stream<RequestInput> = sportSinks.HTTP

	const betslipDom$: Stream<VNode> = betslipSinks.DOM

	const http$: Stream<RequestInput> =
		xs.merge(menuHttp$, sportHttp$)

	const history$: Stream<string> = containerMenuHistory$

	const vdom$: Stream<VNode> =
		xs.combine(
			containerMenuDom$,
			menuDom$,
			sportDom$,
			betslipDom$,
		).map(([containerMenuDom, menuDom, sportDom, betslipDom]) =>
			div('.container', [
				div('.container__title',
					'Sky Bet POC'
				),
				containerMenuDom,
				div('.container__content', [
					menuDom,
					sportDom,
					betslipDom,
				])
			])
		)

	return {
		DOM: vdom$,
		HTTP: http$,
		onion: xs.empty(),
		History: history$,
	}
}

export default App
