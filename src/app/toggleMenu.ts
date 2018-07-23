import { VNode, li, div, } from '@cycle/dom'
import xs, { Stream } from 'xstream'
import { StateSource } from 'cycle-onionify'

import { Menu } from './sideMenu'

interface State extends Menu {
	title: string, // no ?, should be there for a toggle menu
}

interface Sinks {
	DOM: Stream<VNode>,
}

interface Sources {
	onion: StateSource<State>
}

function ToggleMenu(sources: Sources): Sinks {
	const state$ = sources.onion.state$

	const vdom$ = xs.of(li(123))
	// state$.debug(console.log).map(state =>
	//   li('.tog',
	//     div('toggle menu - ' + state.title)
	//   )
	// )

	return {
		DOM: vdom$,
	}
}

export default ToggleMenu
