import { li, h4, a, ul, VNode, DOMSource } from '@cycle/dom'
import { Stream } from 'xstream'
import { StateSource } from 'cycle-onionify'

import { Menu } from './sideMenu'
import { getTargetDataUrl } from './misc/helpers'

interface State extends Menu { }

interface Sinks {
	DOM: Stream<VNode>,
	History: Stream<string>
}

interface Sources {
	DOM: DOMSource,
	onion: StateSource<State>
}

function renderMenu({ title, items }: Menu): VNode {
	return (
		li('.list', [
			title && items && h4('.menu__subTitle', title),
			items && ul('.menu__list',
				items.map(item =>
					li('.menu__item',
						a('.menu__link', {
							attrs: {
								href: item.url,
								title: item.title,
							},
							dataset: {
								dataUrl: item.url
							}
						}, item.title)
					)
				)
			),
		])
	)
}

function SimpleMenu(sources: Sources): Sinks {
	const state$ = sources.onion.state$

	const history$ =
		sources.DOM
			.select('.menu__link')
			.events('click')
			.map(getTargetDataUrl)

	const vdom$ =
		state$
			.map(renderMenu)

	return {
		DOM: vdom$,
		History: history$,
	}
}

export default SimpleMenu
