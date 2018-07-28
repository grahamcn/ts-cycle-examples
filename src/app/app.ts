import xs, { Stream } from 'xstream'
import { div, VNode, ul, li, a, DOMSource, } from '@cycle/dom'
import { Location } from 'history'
import { Reducer, StateSource } from 'cycle-onionify'

import StateComponent from './state'
import ListComponent from './list'
import DefaultComponent from './default'

import '../scss/styles.scss'

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

const menu = [{
	title: 'default',
	url: '/',
}, {
	title: 'state',
	url: '/state',
}, {
	title: 'list',
	url: '/list',
}]

function renderMenuItem(menuItem) {
	return li('.list-item',
		a('.link', {
			attrs: {
				href: menuItem.url,
			},
			dataset: {
				dataUrl: menuItem.url
			}
		}, menuItem.title)
	)
}

function App(sources: Sources): Sinks {

	const path$: Stream<string> =
		sources.History
			.map(({pathname}) => pathname)

	const component$: any =
		path$.map(path => {
			switch (path) {
				case '/state':
					return StateComponent(sources)
				case '/list':
					return ListComponent(sources)
				default:
					return DefaultComponent(sources)
			}
		})

	const componentDom$: Stream<VNode> =
		component$.map(componentSource => componentSource.DOM)
			.flatten()
			.map(dom =>
				div('.component', dom)
			)

	// repeat above for history, http wen required.

	const menuDom$ =
		xs.of(menu)
			.map(menuItems =>
				ul('.list',
					menuItems.map(renderMenuItem)
			)
		)

	const history$ =
		sources.DOM
			.select('.link')
			.events('click')
			.map((e: MouseEvent) => {
				event.preventDefault()
				const target: EventTarget = event.target
				return target['dataset'].dataUrl
			})



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
		onion: xs.never(),
		History: history$,
	}
}

export default App
