import { div, VNode } from '@cycle/dom'
import xs, { Stream } from 'xstream'
import { Location } from 'history'
import { RequestInput, HTTPSource } from '@cycle/http'

import { dropRepeats } from './misc/xstream.extra'

import {
	pick,
	transformPathToSecondaryDataKey,
	getPageDataUrl,
} from './misc/helpers'

import {
	simpleHttpResponseReplaceError,
} from './misc/helpers.xs'

interface Sinks {
	DOM: Stream<VNode>,
	HTTP: Stream<RequestInput>
}

interface Sources {
	History: Stream<Location>,
	HTTP: HTTPSource,
}

function Sport(sources: Sources): Sinks {

	const secondaryDataKey$ =
		sources.History
			.map(pick('pathname'))
			.map(transformPathToSecondaryDataKey)
			.compose(dropRepeats())

	const pageHttp$ =
		secondaryDataKey$.map(key => ({
			url: getPageDataUrl(key),
			'category': 'page-data',
			lazy: true,
		}))

	const pageData$ =
		sources.HTTP
			.select('page-data')
			.map(simpleHttpResponseReplaceError)
			.flatten()
			.map(res => res.body)

	const successPageData$ = pageData$.filter(data => !data.err)
	const errorPageData$ = pageData$.filter(data => !!data.err)

	const successPageDom$: Stream<VNode> = successPageData$.map(res => div(JSON.stringify(res)))
	const errorPageDom$: Stream<VNode> = errorPageData$.map(res => div(JSON.stringify(res)))

	const vdom$: Stream<VNode> =
		xs.merge(
			successPageDom$,
			errorPageDom$,
		).startWith(div('loading...'))

	return {
		DOM: vdom$,
		HTTP: pageHttp$,
	}
}

export default Sport
