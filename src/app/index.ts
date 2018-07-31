import xs, { Stream } from 'xstream'
import { div, VNode, ul, li, a, DOMSource, map, } from '@cycle/dom'
import isolate from '@cycle/isolate'
import { Location } from 'history'
import { Reducer, StateSource } from 'cycle-onionify'

import { renderMenu } from './menu'
import StateComponent from './state'
import ListComponent from './list'
import DefaultComponent from './default'
import DragComponent from './drag'

import '../scss/styles.scss'
import Logger from './logger'
import { buffer}  from './xstream.extra'

interface Component extends Object {
	onion?: Stream<Reducer<State>>
	DOM?: Stream<VNode>
	Log?: Stream<string>
}

interface State { }

interface Sinks {
	DOM: Stream<VNode>
	onion: Stream<Reducer<State>>
	History: Stream<string>
	Log: Stream<string>
}

interface Sources {
	DOM: DOMSource
	History: Stream<Location>
	onion: StateSource<State>
}

function App(sources: Sources): Sinks {

	const path$: Stream<string> =
		sources.History
			.map(({pathname}) => pathname)

	const menuVDom = renderMenu()
	const menuDom$ = xs.of(menuVDom)

	const history$ =
		sources.DOM
			.select('.link')
			.events('click')
			.map((e: MouseEvent) => {
				event.preventDefault()
				const target: EventTarget = event.target
				return target['dataset'].dataUrl
			})

	const componentSinks$: Stream<Component> =
		path$.map(path => {
			switch (path) {
				case '/state':
					return isolate(StateComponent)(sources)
				case '/list':
					return isolate(ListComponent)(sources)
					case '/drag':
					return DragComponent(sources)
				default:
					return DefaultComponent(sources)
			}
		})

	const componentDom$: Stream<VNode> =
		componentSinks$.map(componentSinks => componentSinks.DOM || xs.empty())
			.flatten()
			.map(dom => div('.component', dom))

	const componentOnion$: Stream<Reducer<State>> =
		componentSinks$.map(componentSinks => componentSinks.onion || xs.empty())
			.flatten()

	const componentLog$: Stream<string> =
		componentSinks$.map(componentSinks => componentSinks.Log || xs.empty())
			.flatten()

	// logging... AOP for anything none isolated (not super useful perhaps)
	const loggerLog$ = Logger(sources).Log

	// merge those logs with all child logs
	const appLog$ =
		xs.merge(
			loggerLog$,
			componentLog$,
		)

	// buffer the log$ for 5 seconds.
	// this could equally be tied into request animation frame, say, or while page data is loading is triggered.
	const separator = xs.periodic(5000)
	// the below gives a stream of arrays of strings.
	const bufferedLog$: Stream<string[]> = appLog$.compose(buffer(separator))

	// convert this to stream of strings
	const explodedBuffered$: Stream<string> =
		bufferedLog$.map((arrayOfString: string[]): Stream<string> =>
				xs.from(arrayOfString)
			).flatten()

	// dom is the menu vdom node combined with the child component vdom node
	const vdom$: Stream<VNode> =
		xs.combine(
			menuDom$,
			componentDom$,
		).map(([menuDom, componentDom]) =>
			div('.container', [
				menuDom,
				componentDom,
			])
		)

	return {
		DOM: vdom$,
		onion: componentOnion$,
		History: history$,
		Log: explodedBuffered$,
	}
}

export default App
