import { div, VNode } from '@cycle/dom'
import xs, { Stream } from 'xstream'
import { Location } from 'history'
import { RequestInput, HTTPSource } from '@cycle/http'

import { dropRepeats } from './misc/xstream.extra'

import {
	pick,
	transformPathToSecondaryDataKey,
	getTertiaryMenuDataUrl,
	groupByCountry,
	simpleHttpResponseReplaceError,
} from './misc/helpers'

interface Sinks {
	DOM: Stream<VNode>,
	HTTP: Stream<RequestInput>
}

interface Sources {
	History: Stream<Location>,
	HTTP: HTTPSource,
}

function Menu(sources: Sources): Sinks {

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

	// define a stream of menu data responses
	const menuData$ =
		sources.HTTP
			.select('tertiary-menu')
			.map(simpleHttpResponseReplaceError)
			.flatten()
			.map(res => res.body)

	const successMenuData$ = menuData$.filter(data => !data.error)
	const errorMenuData$ = menuData$.filter(data => data.error)

	// start - next dom, the grouped countries
	const groupedByCountry$: xs<Map<string, object>> =
		menuData$
			.filter(menuData => !menuData.error)
			.map(pick('data'))
			.map(pick('types'))
			.map(groupByCountry)
			.map(map => new Map([...map.entries()].sort())) // sort a map by id
			.debug(console.log)

	const successMenuDom$: Stream<VNode> = successMenuData$.map(res => div(JSON.stringify(res)))
	const errorMenuDom$: Stream<VNode> = errorMenuData$.map(res => div('No data for this segment'))

	const vdom$: Stream<VNode> =
		xs.merge(
			successMenuDom$,
			errorMenuDom$,
		).startWith(div('loading...'))

	return {
		DOM: vdom$,
		HTTP: menuHttp$,
	}
}

export default Menu
