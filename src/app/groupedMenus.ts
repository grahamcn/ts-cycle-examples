import { VNode, DOMSource, div, li, h4, ul } from '@cycle/dom'
import xs, { Stream } from 'xstream'
import { StateSource, makeCollection } from 'cycle-onionify'
import isolate from '@cycle/isolate'

import { MenuGroup } from './sideMenu'
import ToggleMenu from './toggleMenu'

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

  const toggleMenuLens = {
    get: state => state.items
  }

  const ToggleMenuList: any = makeCollection({
    item: ToggleMenu,
    itemKey: (item: any) => item.id,
		itemScope: key => key,
		collectSinks: instances => {
			return {
				DOM: instances.pickCombine('DOM'),
			}
		}
	})

  const toggleMenuListSinks = isolate(ToggleMenuList, {onion: toggleMenuLens})(sources)
	const toggleMenuListSinksDom$: Stream<Array<VNode>> = toggleMenuListSinks.DOM

  const vdom$ =
    xs.combine(
      state$,
      toggleMenuListSinksDom$,
    ).map(([state, toggleMenuListSinksDom]) =>
      li('.list', [
        h4('.menu__subTitle', state.title),
        ul('.list', [
          ...toggleMenuListSinksDom,
        ]),
      ])
		)

	return {
		DOM: vdom$,
	}
}

export default GroupedMenus
