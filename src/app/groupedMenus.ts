import { VNode, DOMSource, div, li } from '@cycle/dom'
import { Stream } from 'xstream'
import { StateSource } from 'cycle-onionify'

import { MenuGroup } from './sideMenu'

interface State extends MenuGroup {}

interface Sinks {
	DOM: Stream<VNode>,
}

interface Sources {
	DOM: DOMSource,
	onion: StateSource<State>
}

function GroupedMenus(sources: Sources): Sinks {
  const state$ = sources.onion.state$

  // state is MenuGroup
  // Lens is items / menus

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

export default GroupedMenus
