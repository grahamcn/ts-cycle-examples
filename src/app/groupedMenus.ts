import { VNode, DOMSource, div, li, h4, ul } from '@cycle/dom'
import xs, { Stream } from 'xstream'
import { StateSource, makeCollection } from 'cycle-onionify'
import isolate from '@cycle/isolate'

import { MenuGroup } from './sideMenu'
import ToggleMenu from './toggleMenu'

interface State extends MenuGroup { }

interface Sinks {
	DOM: Stream<VNode>,
	History: Stream<string>
}

interface Sources {
	DOM: DOMSource,
	onion: StateSource<State>
}

function GroupedMenus(sources: Sources): Sinks {
	const state$ = sources.onion.state$

	const toggleMenuLens = {
		get: (state: State) => state.groups
	}

	const ToggleMenuList: any = makeCollection({
		item: ToggleMenu,
		itemKey: (item: any) => item.id,
		itemScope: key => key,
		collectSinks: instances => {
			return {
				DOM: instances.pickCombine('DOM'),
				History: instances.pickMerge('History'),
			}
		}
	})

	const toggleMenuListSinks = isolate(ToggleMenuList, { onion: toggleMenuLens })(sources)
	const toggleMenuListSinksDom$: Stream<VNode[]> = toggleMenuListSinks.DOM
	const toggleMenuListSinksHistory$: Stream<string> = toggleMenuListSinks.History

	const vdom$ =
		xs.combine(
			state$,
			toggleMenuListSinksDom$,
		).map(([state, toggleMenuListSinksDom]) =>
			li('.menu__list', [
				h4('.menu__subTitle', state.title),
				ul('.menu__list', [
					...toggleMenuListSinksDom,
				]),
			])
		)

	return {
		DOM: vdom$,
		History: toggleMenuListSinksHistory$,
	}
}

export default GroupedMenus
