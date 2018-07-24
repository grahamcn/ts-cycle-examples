export interface Competition {
	id: string
	name: string
	urlName: string
	displayOrder: number
	preLiveEvents?: Event[]
	liveEvents?: Event[]
}

export interface Event {
	id: string
	name: string
	status: string
	live: boolean
	started: boolean
	startTime: string
	displayOrder: number
	urlName: string,
	markets: Market[]
}

export interface Market {
	id: string
	name: string
	minorCode: string
	status: string
	inRunning: boolean
	displayOrder: boolean
	outcomes: Outcome[]
}

export interface Outcome {
	id: string
	name: string
	type: string
	price: number
	priceDen: number
	priceNum: number
	displayOrder: number
	status: string
}

const basicEventDetails = (({id, name, urlName, startTime, displayOrder}: Event) => ({id, name, urlName, startTime, displayOrder}))
const dynamicEventDetails = (({id, status, started, live, }: Event) => ({id, status, started, live,}))

export function flattenPageData(pageData): any {

	const flattenedData =
		pageData.data.types
			.reduce((dataMap, competition) => {

				dataMap.competitions[competition.urlName] = {
					...competition,
					events: (competition.preLiveEvents || []).map(basicEventDetails)
				}

				// an event update prelive to live mean the competition events are resorted.
				// the events in the mapState world are only connecting to their status state, as it were

				const processEvents =
					(competition.preLiveEvents || []).concat(competition.liveEvents || [])
					.forEach(event => {
						dataMap.events[event.id] = {
							...dynamicEventDetails(event),
						}
					})

				return dataMap
			}, {
				competitions: {},
				events: {},
				markets: {},
				outcomes: {},
			})

	console.log(flattenedData)

	return pageData
}
