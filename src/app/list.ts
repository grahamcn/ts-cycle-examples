import xs, { Stream } from 'xstream'
import { div, VNode, ul, h2, p,  } from '@cycle/dom'
import { Reducer, makeCollection, StateSource } from 'cycle-onionify'
import ListItem from './list.item'
import isolate from '@cycle/isolate'

export interface ListItem {
	id: number
	count: number
}

interface State {
	list: ListItem[]
}

interface Sinks {
	DOM: Stream<VNode>,
	onion: Stream<Reducer<State>>
}

interface Sources {
	onion: StateSource<State>
}

function List(sources: Sources): Sinks {
	const state$ = sources.onion.state$

	const defaultReducer$: Stream<Reducer<State>> =
		xs.of(function initialReducer(prev: State): State {
			if (typeof prev === 'undefined') {
				return { list: [] }
			} else {
				return prev
			}
		})

	// on item will be added to the state property list every second
	const addOneItemReducer$: Stream<Reducer<State>> =
		xs.periodic(2000)
			.map(i =>
				function addOneItemReducer(prev: State): State {
					return {
						...prev,
						list: [...prev.list, {
							id: i,
							count: i,
						}]
					}
				}
			)

	const List = makeCollection({
		item: ListItem,
		itemKey: (item: any) => item.id,
		itemScope: key => key,
		collectSinks: instances => {
			return {
				onion: instances.pickMerge('onion'), // merge all the state streams
				DOM: instances.pickCombine('DOM') // combine all the dom streams
			}
		}
	})

	const listSinks = isolate(List, 'list')(sources)
	const listSinksDOM$: Stream<VNode[]> = listSinks.DOM
	const linkOnion$: Stream<Reducer<any>> = listSinks.onion

	const stateDom$ = state$.map(state => p('.code', JSON.stringify(state)))

	const reducer$ = xs.merge(defaultReducer$, addOneItemReducer$, linkOnion$)

	const vdom$: Stream<VNode> =
		xs.combine(
			stateDom$,
			listSinksDOM$,
		).map(([stateDom, listSinksDOM]) =>
				div([
					h2('.header', 'State'),
					stateDom,
					ul('.list', listSinksDOM)
				])
			)

	return {
		DOM: vdom$,
		onion: reducer$,
	}
}

export default List
