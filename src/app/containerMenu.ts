import xs, { Stream } from 'xstream';
import { div, VNode, ul, li, a, DOMSource } from '@cycle/dom'

import { containerMenuData } from './misc/constants'
import { getTargetDataUrl } from './misc/helpers'
import { MenuItem } from './sideMenu'

export interface Sources {
	DOM: DOMSource
}

export interface Sinks {
	DOM: Stream<VNode>,
	History: Stream<string>
}

function ContainerMenu(sources): Sinks {

	const history$ =
		sources.DOM.select('.containerMenu__link')
			.events('click')
			.map(getTargetDataUrl)

	const vdom$ =
		xs.of(containerMenuData)
			.map(data =>
				div('.containerMenu',
					ul('.containerMenu__list',
						data.map((menuItem: MenuItem) =>
							li('.containerMenu__item',
								a('.containerMenu__link', {
									attrs: {
										title: menuItem.title,
										href: menuItem.url,
									},
									dataset: {
										dataUrl: menuItem.url
									}
								}, menuItem.title
								)
							))
					)
				)
			)

	return {
		DOM: vdom$,
		History: history$,
	}
}

export default ContainerMenu

