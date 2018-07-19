import { div, VNode } from '@cycle/dom'
import xs, { Stream } from 'xstream'
import { Location } from 'history'
import { RequestInput, HTTPSource } from '@cycle/http'

import { dropRepeats } from './misc/xstream.extra'

import {
	pick,
	transformPathToSecondaryDataKey,
	getTertiaryMenuDataUrl
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
			'category': 'tertiary-menu'
		}))

	// define a stream of menu data responses
	const menuResponse$ =
		sources.HTTP
			.select('tertiary-menu')
			.flatten()

	const vdom$ =
		menuResponse$
			.map(res => div(JSON.stringify(res)))
			.startWith(div('loading...'))

	return {
		DOM: vdom$,
		HTTP: menuHttp$,
	}
}

export default Menu
