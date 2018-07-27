import { li, h4, a, ul, VNode, DOMSource } from '@cycle/dom'
import { Stream } from 'xstream'
import { StateSource } from 'cycle-onionify'

import { Menu } from './sideMenu.interfaces'
import { getTargetDataUrl } from './misc/helpers'
import { renderMenuItems } from './misc/helpers.dom'

interface State extends Menu { }

interface Sinks {
	DOM: Stream<VNode>,
	History: Stream<string>
}

interface Sources {
	DOM: DOMSource,
	onion: StateSource<State>
}

function SimpleMenu(sources: Sources): Sinks {
	// this is just a contexulaized list of links
	const state$ = sources.onion.state$

	const history$ =
		sources.DOM
			.select('.menu__link')
			.events('click')
			.map(getTargetDataUrl)

	const vdom$ =
		state$
			.map(renderMenuItems)

	return {
		DOM: vdom$,
		History: history$,
	}
}

export default SimpleMenu
