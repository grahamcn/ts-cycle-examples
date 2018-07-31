import xs, { Stream } from 'xstream'
import { div, h2, p, VNode, DOMSource, button, } from '@cycle/dom'
import { Reducer, StateSource } from 'cycle-onionify'

interface State {
	count: number
}

interface Sinks {
	DOM: Stream<VNode>
	onion: Stream<Reducer<State>>
	Log: Stream<string>
}

interface Sources {
	DOM: DOMSource
	onion: StateSource<State>
}

function State(sources: Sources): Sinks {
	const state$: Stream<State> = sources.onion.state$

	// set initial state with a default reducer
	// it is a good idea to use a defaultReducer$ instead of an initialReducer$, as a rule of thumb
	const defaultReducer$: Stream<Reducer<State>> =
		xs.of(function defaultReducer(prevState: State): State {
			if (typeof prevState === 'undefined') {
				return { count: 0 } // Parent didn't provide state for the child, so initialize it.
			} else {
				return prevState // Let's just use the state given from the parent.
			}
		})

	// map a click on increment button to a reducer function applied to state
	const incrementClick$ = sources.DOM.select('.increment').events('click')
	const incrementReducer$: Stream<Reducer<State>> =
		incrementClick$
			.mapTo(function incrementReducer(prev: State): State {
				return {
					count: prev.count + 1
				}
			})

	// we created the const as we're going to log these too.
	const stateLog$ = incrementClick$.mapTo('.increment clicked')

	// merge all the streams of reducer functions that will be applied to state
	const reducer$: Stream<Reducer<State>> =
		xs.merge(defaultReducer$, incrementReducer$)

	// transform the state to a Virtual Node
	const vdom$: Stream<VNode> =
		state$.map((state: State) =>
			div([
				h2('.header', 'State'),
				p('.code', JSON.stringify(state)),
				button('.increment', 'Increment')
			])
		)

	// return a srteam of Virtual Dom Nodes and a stream of reducers to act on our isolated state
	return {
		DOM: vdom$,
		onion: reducer$,
		Log: stateLog$,
	}
}

export default State
