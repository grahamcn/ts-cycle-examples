import xs, { Stream } from 'xstream'
import { div, VNode, DOMSource } from '@cycle/dom'
import { RequestInput, HTTPSource } from '@cycle/http'
import { Location } from '@cycle/history'
import { StateSource, Reducer } from 'cycle-onionify'

import '../css/styles.css'

import SideMenu from './sideMenu'
import Sport from './sport'
import Betslip from './betslip'
import ContainerMenu from './containerMenu'
import isolate from '@cycle/isolate'

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
	const sideMenuSinks = isolate(SideMenu, 'sideMenu')(sources)
	const sportSinks = Sport(sources)
	const betslipSinks = Betslip(sources)

	const containerMenuDom$ = containerMenuSinks.DOM
	const containerMenuHistory$ = containerMenuSinks.History

	const sideMenuDom$: Stream<VNode> = sideMenuSinks.DOM
	const sideMenuHttp$: Stream<RequestInput> = sideMenuSinks.HTTP
	const sideMenuReducer$: Stream<Reducer<State>> = sideMenuSinks.onion
	const sideMenuHistory$: Stream<string> = sideMenuSinks.History

	const sportDom$: Stream<VNode> = sportSinks.DOM
	const sportHttp$: Stream<RequestInput> = sportSinks.HTTP

	const betslipDom$: Stream<VNode> = betslipSinks.DOM

	const http$: Stream<RequestInput> =
		xs.merge(sideMenuHttp$, sportHttp$)

	const history$: Stream<string> =
		xs.merge(
			containerMenuHistory$,
			sideMenuHistory$,
		)

	const vdom$: Stream<VNode> =
		xs.combine(
			containerMenuDom$,
			sideMenuDom$,
			sportDom$,
			betslipDom$,
		).map(([containerMenuDom, sideMenuDom, sportDom, betslipDom]) =>
			div('.container', [
				div('.container__title',
					'Sky Bet POC'
				),
				containerMenuDom,
				div('.container__content', [
					sideMenuDom,
					sportDom,
					betslipDom,
				])
			])
		)

	return {
		DOM: vdom$,
		HTTP: http$,
		onion: sideMenuReducer$,
		History: history$,
	}
}

export default App
