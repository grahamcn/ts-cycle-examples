import { defaultSecondarySegment, baseUrl } from './constants'

interface PickKey extends Function {
	(s: Object): string | number | Object // could be others, extend if required
}

// returns a function that will pick the key created in the closure from a given object
export function pick(key: string | number): PickKey {
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

export function groupByCountry(types: any[]): Map<string, object> {
	return types // competitions, with the country name embedded in each type name. eg "england - premier league", "england - chanpionship"
		.map(type =>
			Object.assign({}, type, {
				country: type.name.split(' - ')[0].trim(),
				title: type.name.split(' - ')[1].trim(),
			})
		)
		.reduce((acc, enrichedType) => {
			return !acc.get(enrichedType.country) ?
				acc.set(enrichedType.country, {
					competitions: [enrichedType]
				}) :
				acc.set(enrichedType.country, {
					competitions: [...acc.get(enrichedType.country).competitions, enrichedType]
				})
		}, new Map())
}

export function sortMapByKey(map: Map<string|number, any>): Map<string|number, any> {
	return new Map([...map.entries()].sort())
}
