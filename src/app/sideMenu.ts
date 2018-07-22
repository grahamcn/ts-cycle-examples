import { div, VNode, ul } from '@cycle/dom'
import xs, { Stream } from 'xstream'
import { Location } from 'history'
import { RequestInput, HTTPSource } from '@cycle/http'
import { StateSource, Reducer, makeCollection } from 'cycle-onionify'
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

import Menu from './menu'

export interface Menu {
	id: number,
	title?: string,
	items: Array<MenuItem>
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
	History: Stream<string>,
}

interface Sources {
	History: Stream<Location>,
	HTTP: HTTPSource,
	onion: StateSource<State>,
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

	// menu groups are the component state (well, an array of menu groups, empty or otherwise).
	const menuGroups$: xs<Array<Map<string, MenuItem>>> =
		successMenuData$.map(transformToMenuGroups)

	const errorMenuDom$: Stream<VNode> = errorMenuData$.map(res => div('No menu data for this segment'))

	const List = makeCollection({
		item: Menu,
		itemKey: (item: any) => item.id,
		itemScope: key => key,
		collectSinks: instances => {
			return {
				DOM: instances.pickCombine('DOM').map(itemVNodes => itemVNodes),
				History: instances.pickMerge('History').map(s => {
					console.log(s)
					return s
				})
			}
		}
	})

	const listSinks = List(sources)
	const listSinksDOM$: xs<Array<VNode>> = listSinks.DOM
	const listSinksHistory$: xs<string> = listSinks.History

	const successMenuDom$: Stream<VNode> =
		listSinksDOM$.map(listDoms =>
			div('.menu',
				ul(listDoms)
			)
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

	return {
		DOM: vdom$,
		HTTP: menuHttp$,
		History: listSinksHistory$,
		onion: reducer$,
	}
}

export default SideMenu
