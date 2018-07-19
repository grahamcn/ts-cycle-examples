import xs from 'xstream'
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

// when the stream returns an error, replace an error on the stream with a non erroneous stream (ie don't kill the stream),
// with an error property on it to identify
export function simpleHttpResponseReplaceError(response$) {
	return response$.replaceError(err => {
		const body = {
			error: err,
			message: null,
		}

		switch (err.status) {
			case 404:
				body.message = '404 Not found'
				break
			case 403:
				body.message = '403 Not authorized'
				break
			case 401:
				body.message = '401 Not authenticated'
				break
			default:
				body.message = 'Generic server error'
				break
		}

		return xs.of({
			body,
		})
	})
}
