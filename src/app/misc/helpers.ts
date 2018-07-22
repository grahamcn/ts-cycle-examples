import {
	defaultSecondarySegment,
	baseUrl,
	staticTertiaryMenuItems,
} from './constants'

import {MenuItem} from '../sideMenu'

interface PickKey extends Function {
	(s: Object): string | number | Object // could be others, extend if required
}

// returns a function that will pick the key created in the closure from a given object
export function pick(key: any): PickKey {
	return function (o: Object): any {
		return o[key] || undefined // not null, see Crockford
	}
}

export function transformPathToSecondaryDataKey(pathname: string, defaultSecondary: string = defaultSecondarySegment): string {
	return pathname.split('/')[1] || defaultSecondary
}

export function getTertiaryMenuDataUrl(key: string, base: string = baseUrl): string {
	return `${base}/${key}/competitions`
}

export function getPageDataUrl(key: string, base: string = baseUrl): string {
	return `${base}/${key}/events`
}

export function transformToMenuItemsByCountry(types: any[], secondarySegmentUrl: string): Map<string, Array<MenuItem>> {
	return types // competitions, with the country name embedded in each type name. eg "england - premier league", "england - chanpionship"
		.map(type =>
			Object.assign({}, type, {
				country: type.name.split(' - ')[0].trim(),
				title: type.name.split(' - ')[1].trim(),
				url: `/${secondarySegmentUrl}/${type.urlName}`,
			})
		)
		.reduce(groupByKey('country'), new Map())
}

// reducer fn that groups objects as an array on a Map, keyed by key
function groupByKey(key) {
	return (acc, curr): Map<string, Array<any>> => {
		return !acc.get(curr[key]) ?
			acc.set(curr[key], [curr])
			:
			acc.set(curr[key], [...acc.get(curr[key]), curr])
	}
}

export function sortMapByKey(map: Map<string, any>): Map<string, any> {
	return new Map([...map.entries()].sort())
}

export function getTargetDataUrl(event: MouseEvent): string {
	event.preventDefault()
	const target: EventTarget = event.target
	return target['dataset'].dataUrl
}

export function transformToMenuGroups(menuData, secondaryKey = 'calcio', base = baseUrl): Array<any> {
	const secondarySegmentUrl = menuData.data.urlName

	const inEvidenzaMenuItems =
		menuData.data.types
			.slice(0, 5)
			.map(({urlName, name}) => {
				return {
					title: name.split(' - ')[1].trim(),
					url: `/${secondarySegmentUrl}/${urlName}`,
				}
			})

	const tutteLeCompetizioniMenuItems =
		[menuData]
			.map(pick('data'))
			.map(pick('types'))
			.map((competitions: Array<any>)  => transformToMenuItemsByCountry(competitions, secondarySegmentUrl)) // returns a  Map
			.map(menuItemsByCountry => sortMapByKey(menuItemsByCountry))[0]

	const menuGroups = [{
		items: staticTertiaryMenuItems(secondarySegmentUrl),
	}, {
		title: 'In Evidenza',
		items: inEvidenzaMenuItems,
	}, {
		title: 'Tutte Le Competizioni',
		itemsGroups: tutteLeCompetizioniMenuItems,
	}]

	return menuGroups
}
