import xs, { Stream } from 'xstream'
import { div, VNode, DOMSource } from '@cycle/dom'
import { RequestInput, HTTPSource } from '../../node_modules/@cycle/http'
import { Location } from 'history'

import '../css/styles.css'

import Menu from './menu'
import Sport from './sport'
import Betslip from './betslip'

interface Sinks {
  DOM: Stream<VNode>,
  HTTP: Stream<RequestInput>,
}

interface Sources {
  DOM: DOMSource,
  HTTP: HTTPSource,
  History: Stream<Location>,
}

function App(sources: Sources): Sinks {

  const menuSinks = Menu(sources)
  const sportSinks = Sport(sources)
  const betslipSinks = Betslip(sources)

  const menuDom$: Stream<VNode> = menuSinks.DOM
  const menuHttp$: Stream<RequestInput> = menuSinks.HTTP
  const sportDom$: Stream<VNode> = sportSinks.DOM
  const betslipDom$: Stream<VNode> = betslipSinks.DOM

  const vdom$: Stream<VNode> =
    xs.combine(
      menuDom$,
      sportDom$,
      betslipDom$,
    ).map(([menuDom, sportDom, betslipDom]) =>
      div('.container', [
        div('.container__title', 'Sky Bet POC'),
        div('.container__content', [
          menuDom,
          sportDom,
          betslipDom,
        ])
      ])
    )

	return {
    DOM: vdom$,
    HTTP: menuHttp$,
	}
}

export default App
