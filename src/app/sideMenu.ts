import { div, VNode, ul, DOMSource } from '@cycle/dom'
import xs, { Stream } from 'xstream'
import { Location } from 'history'
import { RequestInput, HTTPSource } from '@cycle/http'
import { StateSource, Reducer, makeCollection } from 'cycle-onionify'
import isolate from '@cycle/isolate'
import { dropRepeats } from './misc/xstream.extra'

import {
	pick,
	transformPathToSecondaryDataKey,
	getTertiaryMenuDataUrl,
	transformToMenuGroups,
} from './misc/helpers'

import {
	simpleHttpResponseReplaceError,
} from './misc/helpers.xs'

import GroupedMenus from './groupedMenus'
import SimpleMenu from './SimpleMenu'

export interface Menu {
	id: number,
	title?: string,
	items: Array<MenuItem>
	itemGroups: Map<string, any>
}

export interface MenuItem {
	title: string
	url: string,
}

interface State extends Array<Menu> {}

interface Sinks {
	DOM: Stream<VNode>,
	HTTP: Stream<RequestInput>,
	onion: Stream<Reducer<State>>,
	History: Stream<string | {}>,
}

interface Sources {
	History: Stream<Location>,
  HTTP: HTTPSource,
  DOM: DOMSource,
	onion: StateSource<State>
}

// Convert to MVI in a copy of this file as an example.

function SideMenu(sources: Sources): Sinks {
	const state$ = sources.onion.state$

	// define a stream of sport
	const secondaryDataKey$ =
		sources.History
			.map(pick('pathname'))
			.map(transformPathToSecondaryDataKey)
			.compose(dropRepeats()) // akin to memoize / shouldComponentUpdate. if we change urls, we don't change menu unless segment 1 changes

	// define a stream of menu data requests
	const menuHttp$ =
		secondaryDataKey$.map(key => ({
			url: getTertiaryMenuDataUrl(key),
			'category': 'tertiary-menu',
			// https://github.com/cyclejs/cyclejs/issues/355
			lazy: true, // cancellable
		}))

	const menuData$ =
		sources.HTTP
			.select('tertiary-menu')
			.map(simpleHttpResponseReplaceError)
			.flatten()
			.map(res => res.body)

	const successMenuData$ = menuData$.filter(data => !data.err)
	const errorMenuData$ = menuData$.filter(data => !!data.err)

	// END DATA

	// START KINDA INTENT

	// menu groups are the component state (well, an array of menu groups, empty or otherwise).
	const menuGroups$: xs<Array<Map<string, MenuItem>>> =
		successMenuData$.map(transformToMenuGroups)

  const simpleMenuListLens = {
		get: (state: Array<Menu>) => {
      return state.filter(menu => !!menu.items)
    },
		set: (state, childState) => state // ignore updates
  }

	const SimpleMenuList: any = makeCollection({
    item: SimpleMenu,
    itemKey: (item: any) => item.id,
		itemScope: key => key,
		collectSinks: instances => {
			return {
				DOM: instances.pickCombine('DOM'), // combine all the dom streams
				History: instances.pickMerge('History')
			}
		}
	})

	const listSinks = isolate(SimpleMenuList, { onion: simpleMenuListLens })(sources) // list idetifies the part of state of loop over
	const listSinksDOM$: Stream<Array<VNode>> = listSinks.DOM
	const listSinksHistory$: Stream<string | {}> = listSinks.History

	// one grouped menu, todo
	const groupedMenusLens = {
		get: state => state.filter(menu => !!menu.itemsGroups)[0],
		set: (state, childState) => state // ignore updates
	}

	const menuGroupSinks = isolate(GroupedMenus, { onion: groupedMenusLens })(sources)
  const menuGroupSinksDom$: Stream<VNode> = menuGroupSinks.DOM

	// VIEW ISH

	const errorMenuDom$: Stream<VNode> = errorMenuData$.map(() => div('No menu data for this segment'))

	const successMenuDom$: Stream<VNode> =
		xs.combine(
			listSinksDOM$,
      menuGroupSinksDom$,
      // menusSinksDom$,
		).map(([listSinksDOM, menuGroupSinksDom]) =>
			div('.menu', [
				ul('.menus',[
          ...listSinksDOM,
          menuGroupSinksDom,
        ])
			])
		)

	// add loading state
	const vdom$: Stream<VNode> =
		xs.merge(
			successMenuDom$,
			errorMenuDom$,
		).startWith(div('loading...'))

	// Reducer / state
	// we iitialize state with an empty array of menu groups, a reducer that returns initial state
	// as we recieve history events, the menuReducer will update state as menuGroups emits events / groups
	const defaultReducer$ = xs.of(function() { return [] })

	const menuReducer$ =
		menuGroups$.map((menuGroups: Array<any>) =>
			function reducer(prevState) {
				return menuGroups
		})

  const reducer$ = xs.merge(defaultReducer$, menuReducer$)

  // history
  const history$ =
    xs.merge(
      listSinksHistory$
    )

	return {
		DOM: vdom$,
		HTTP: menuHttp$,
		onion: reducer$,
		History: history$,
	}
}

export default SideMenu
