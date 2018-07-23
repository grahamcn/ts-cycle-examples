export interface Menu {
	id: string | number,
	title?: string,
	items?: MenuItem[]
	groups?: MenuGroup[]
}

export interface MenuItem {
	title: string
	url: string,
}

export interface MenuGroup {
	title: string,
	groups: Menu[],
}
