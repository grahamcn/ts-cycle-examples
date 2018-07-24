export interface Competition {
	displayOrder: number
	id: string
	liveEvents?: Event[]
	name: string
	preLiveEvents?: Event[]
	urlName: string
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

const eventPassThru = ({id, name, urlName}) => ({
	eventId: id,
	eventName: name,
	eventUrlName: urlName,
})

const marketPassThru = ({id, name}) => ({
	marketId: id,
	marketName: name,
})

const competitionPassThru = ({id, name, urlName}) => ({
	competitionId: id,
	competitionName: name,
	competitionUrlName: urlName,
})

const pickCompetitionProps = ({id, urlName, name, displayOrder}) => ({id, urlName, name, displayOrder})

// undecided if we need any more than id yet populated in the map
// or if this should be a map at all, as we may need an array (ideally ordered)
// see how this falls out.
function createIdMap(array) {
	return array
		.reduce((map, object) => {
			return map.set(object.id, {})
		}, new Map())
}

export function flattenPageData(pageData) {
	// hack or generic competition end point, which doesn't have types
	// will need addressing ie transforming to state shape.
	if (!pageData || !pageData.types) {
		return pageData
	}

	const flattenedDataMap: Map<string, Map<string, Competition|Event|Market|Outcome>> =
		pageData.data.types
			.reduce((accumulatedDataMap, competition) => {

				const allCompetitionEvents =
					(competition.preLiveEvents || []).concat(competition.liveEvents || [])

				// we don't need comps, simple as. i think that holds up. maybe :)
				// we might need something.
				// we always group on an event property - live, date, competition?
				// we currently group by competition, then by date, on the home page
				// consider coupons, outrights and the like.
				accumulatedDataMap.competitions.set(competition.urlName, {
					...competition,
					...pickCompetitionProps(competition), // we don't want live / prelive keys
					event: createIdMap(allCompetitionEvents),
				})

				// an event update prelive to live mean the competition events are re-sorted.
				// that just might be by the by
				allCompetitionEvents.forEach(event => {
					accumulatedDataMap.events.set(event.id, {
						...competitionPassThru(competition),
						...event,
						markets: createIdMap(event.markets)
					})

					event.markets.forEach(market => {
						accumulatedDataMap.markets.set(market.id, {
							...competitionPassThru(competition), // unrequired?
							...eventPassThru(event), // unrequired?
							...market,
							outcomes: createIdMap(market.outcomes)
						})

						// outcomes turn into selections, they need all details embedded
						// such that they can be displayed in the Betslip selections list
						market.outcomes.forEach(outcome => {
							accumulatedDataMap.outcomes.set(outcome.id, {
								...competitionPassThru(competition),
								...eventPassThru(event),
								...marketPassThru(market),
								...outcome,
							})
						})
					})
				})

				return accumulatedDataMap
			}, {
				competitions: new Map(),
				events: new Map(),
				markets: new Map(),
				outcomes: new Map(),
			})

	return flattenedDataMap
}
