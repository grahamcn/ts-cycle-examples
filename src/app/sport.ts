import { div, VNode } from '@cycle/dom'
import xs, { Stream } from 'xstream'
import { Location } from 'history'
import { RequestInput, HTTPSource } from '@cycle/http'

import { dropRepeats } from './misc/xstream.extra'

import {
	pick,
	transformPathToPageDataPath,
	getPageDataUrl,
} from './misc/helpers'

import {
	flattenPageData,
} from './misc/helpers.data'


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

	const pageDataRequestsPath$ =
		sources.History
			.map(pick('pathname'))
			.map(transformPathToPageDataPath)

	const pageHttp$ =
		pageDataRequestsPath$
			.compose(dropRepeats())
			.map(path => ({
				url: getPageDataUrl(path),
				'category': 'page-data',
				lazy: true,
			}))

	const pageData$ =
		sources.HTTP
			.select('page-data')
			.map(simpleHttpResponseReplaceError)
			.flatten()
			.map(res => res.body)

	const successPageData$ =
		pageData$
			.filter(data => !data.err)
			.map(flattenPageData)

	const errorPageData$ =
		pageData$.filter(data => !!data.err)

	const successPageDom$: Stream<VNode> =
		successPageData$.map(res => div('.sport', JSON.stringify(res)))

	const errorPageDom$: Stream<VNode> =
		errorPageData$.map(res => div('.sport', res.err.message))

	const loadingDom$: Stream<VNode> =
		pageDataRequestsPath$
			.compose(dropRepeats())
			.mapTo(div('.sport', 'loading...'))

	const vdom$: Stream<VNode> =
		xs.merge(
			successPageDom$,
			errorPageDom$,
			loadingDom$,
		).startWith(div('.sport', 'initializing...'))

	return {
		DOM: vdom$,
		HTTP: pageHttp$,
	}
}

export default Sport
