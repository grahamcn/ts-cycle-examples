import { VNode, DOMSource, div, li } from '@cycle/dom'
import { Stream } from 'xstream'
import { StateSource } from 'cycle-onionify'

import { Menu } from './sideMenu'

interface State extends Menu {}

interface Sinks {
	DOM: Stream<VNode>,
}

interface Sources {
	DOM: DOMSource,
	onion: StateSource<State>
}

function MenuGroup(sources: Sources): Sinks {
	const state$ = sources.onion.state$

	const vdom$ =
    state$.map(({title}) =>
      li('.list',
        div('menu group - ' + title)
      )
		)

	return {
		DOM: vdom$,
	}
}

export default MenuGroup
