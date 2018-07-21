import { div, VNode } from '@cycle/dom'
import xs, { Stream } from 'xstream'
import { Location } from 'history'
import { RequestInput, HTTPSource } from '@cycle/http'
import { StateSource, Reducer } from 'cycle-onionify'
import { dropRepeats } from './misc/xstream.extra'

import {
	pick,
	transformPathToSecondaryDataKey,
	getTertiaryMenuDataUrl,
	groupByCountry,
	sortMapByKey,
} from './misc/helpers'

import {
	simpleHttpResponseReplaceError,
} from './misc/helpers.xs'

interface GroupedMenu {}

interface State {
	menus: Array<any> // todo, either a list, or a list of groups of lists
}

interface Sinks {
	DOM: Stream<VNode>,
	HTTP: Stream<RequestInput>,
	onion: Stream<Reducer<State>>
}

interface Sources {
	History: Stream<Location>,
	HTTP: HTTPSource,
	onion: StateSource<State>,
}

// Convert to MVI in a copy of this file as an example.

function Menu(sources: Sources): Sinks {
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

	const menuGroups$: xs<Array<Map<string, object>> | any> = // any will become an array of menu items
		successMenuData$
			.map(pick('data'))
			.map(pick('types'))
			.map(groupByCountry) // returns a stream which emits one Map
			.map(sortMapByKey) // sorts the one Map and returns a stream that emits that
			// map that array of one map to an array of 3 menu groups
			// [ static, inEvidenza, grouped (above) ]
			// that is this components state.

	// we iitialize state with an empty array of menu groups, a reducer that returns initial state
	// as we recieve history events, the menuReducer will update state
	const defaultReducer$ = xs.of(function() { return {menus: []} })

	const menuReducer$ =
		menuGroups$.map((menuGroups: Array<any>) =>
			function reducer(prevState) {
				return {
					menus: menuGroups
				}
		})

	const reducer$ = xs.merge(defaultReducer$, menuReducer$)

	const successMenuDom$: Stream<VNode> = successMenuData$.map(res => div(JSON.stringify(res)))
	const errorMenuDom$: Stream<VNode> = errorMenuData$.map(res => div('No menu data for this segment'))

	// add loading state &/ spin this
	// const vdom$: Stream<VNode> =
	// 	xs.merge(
	// 		successMenuDom$,
	// 		errorMenuDom$,
	// 	).startWith(div('loading...'))

		const vdom$ =
			state$.map(((s: any) => div('.menu',
				s.menus.length ? JSON.stringify(s.menus[0].size) : 'empty'
			)))

	return {
		DOM: vdom$,
		HTTP: menuHttp$,
		onion: reducer$,
	}
}

export default Menu
