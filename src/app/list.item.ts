import xs, { Stream } from 'xstream'
import { button, li, p, DOMSource, VNode, h3 } from '@cycle/dom'
import { StateSource, Reducer } from 'cycle-onionify'
import { ListItem } from './list'

export interface State extends ListItem {}

export interface Sources {
	DOM: DOMSource,
	onion: StateSource<State>
}

export interface Sinks {
	DOM: Stream<VNode>,
	onion: Stream<Reducer<State>>,
}

function ListItem(sources: Sources): Sinks {
	const state$ = sources.onion.state$

	const incrementReducer$: Stream<Reducer<State>> =
		sources.DOM
			.select('.increment')
			.events('click')
			.mapTo(function incrementReducer(prev: State): State {
				return {
					id: prev.id,
					count: prev.count + 1
				}
			})

	const deleteReducer$: Stream<Reducer<State>> =
		sources.DOM
			.select('.delete')
			.events('click')
			.mapTo(function deleteReducer() {
				return undefined
			})

	const reducer$: Stream<Reducer<State>> =
		xs.merge(incrementReducer$, deleteReducer$)

	const vdom$: Stream<VNode> =
		state$.map(state =>
			li([
				h3('List Item'),
				p('.code', JSON.stringify(state)),
				button('.increment', {
					attrs: {
						type: 'button',
					},
				}, 'Increment list item instance state'),
				button('.delete', {
					attrs: {
						type: 'button',
					},
				}, 'Delete list item instance')
			])
		)

	return {
		DOM: vdom$,
		onion: reducer$,
	}
}

export default ListItem
