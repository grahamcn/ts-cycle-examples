import { ul, li, a, } from '@cycle/dom'

const menuItems = [{
	title: 'default',
	url: '/',
}, {
	title: 'combine',
	url: '/combine',
}, {
	title: 'merge',
	url: '/merge',
}, {
	title: 'change url',
	url: '/changeUrl',
}, {
	title: 'state',
	url: '/state',
}, {
	title: 'list',
	url: '/list',
}, {
	title: 'drag',
	url: '/drag',
}, {
	title: 'carousel',
	url: '/carousel',
}]

function renderMenuItem(menuItem) {
	return li('.list-item',
		a('.link', {
			attrs: {
				href: menuItem.url,
			},
			dataset: {
				dataUrl: menuItem.url
			}
		}, menuItem.title)
	)
}

export function renderMenu() {
	return ul('.list',
		menuItems.map(renderMenuItem)
	)
}
