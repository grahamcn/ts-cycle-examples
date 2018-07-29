import xs, { Stream } from 'xstream'
import { div, VNode, ul, li, a, DOMSource, } from '@cycle/dom'
import isolate from '@cycle/isolate'
import { Location } from 'history'
import { Reducer, StateSource } from 'cycle-onionify'

import { renderMenu } from './menu'
import StateComponent from './state'
import ListComponent from './list'
import DefaultComponent from './default'
import DragComponent from './drag'

import '../scss/styles.scss'

interface Component extends Object {
	onion?: Stream<Reducer<State>>
	DOM?: Stream<VNode>
}

interface State { }

interface Sinks {
	DOM: Stream<VNode>
	onion: Stream<Reducer<State>>
	History: Stream<string>
}

interface Sources {
	DOM: DOMSource
	History: Stream<Location>
	onion: StateSource<State>
}

function App(sources: Sources): Sinks {

	const path$: Stream<string> =
		sources.History
			.map(({pathname}) => pathname)

	const menuVDom = renderMenu()
	const menuDom$ = xs.of(menuVDom)

	const history$ =
		sources.DOM
			.select('.link')
			.events('click')
			.map((e: MouseEvent) => {
				event.preventDefault()
				const target: EventTarget = event.target
				return target['dataset'].dataUrl
			})

	const componentSinks$: Stream<Component> =
		path$.map(path => {
			switch (path) {
				case '/state':
					return isolate(StateComponent)(sources)
				case '/list':
					return ListComponent(sources)
					case '/drag':
					return DragComponent(sources)
				default:
					return DefaultComponent(sources)
			}
		})

	const componentDom$: Stream<VNode> =
		componentSinks$.map(componentSinks => componentSinks.DOM || xs.empty())
			.flatten()
			.map(dom => div('.component', dom))

	const componentOnion$: Stream<Reducer<State>> =
		componentSinks$.map(componentSinks => componentSinks.onion || xs.empty())
			.flatten()

	const vdom$: Stream<VNode> =
		xs.combine(
			menuDom$,
			componentDom$,
		).map(([menuDom, componentDom]) =>
			div('.container', [
				menuDom,
				componentDom,
			])
		)

	return {
		DOM: vdom$,
		onion: componentOnion$,
		History: history$,
	}
}

export default App
