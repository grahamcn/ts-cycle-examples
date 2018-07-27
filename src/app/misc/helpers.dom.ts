import { MenuItem, Menu } from '../sideMenu.interfaces'
import { ul, h4, li, a, VNode } from '@cycle/dom'

// render list title, list item function
export function renderMenuItems({ title, items }: Menu): VNode {
	return (
		li('.menu__list', [
			title && items && h4('.menu__subTitle', title),
			items && ul('.menu__list',
				items.map(renderMenuItem)
			),
		])
	)
}

// render listlink
export function renderMenuItem(item: MenuItem): VNode {
	return li('.menu__item',
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
}
