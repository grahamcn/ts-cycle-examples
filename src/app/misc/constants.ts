export const defaultSecondarySegment = 'calcio'
export const baseUrl = 'https://vkyyqd7276.execute-api.eu-west-2.amazonaws.com/public/catalog'


export interface MenuItem {
	title: string
	url: string,
}

export const containerMenuData: Array<MenuItem> = [{
	title: 'Home',
	url: '/'
}, {
	title: 'Calcio',
	url: '/calcio'
}, {
	title: 'Tennis',
	url: '/tennis'
}, {
	title: 'Rollerball',
	url: '/rollerball'
}]
