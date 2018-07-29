export const menu = [{
	title: 'default',
	url: '/',
}, {
	title: 'state',
	url: '/state',
}, {
	title: 'list',
	url: '/list',
}, {
	title: 'drag',
	url: '/drag',
}]

export function renderMenuItem(menuItem) {
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
