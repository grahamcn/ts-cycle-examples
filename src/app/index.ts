import xs, { Stream } from 'xstream'
import { div, VNode, DOMSource } from '@cycle/dom'
import isolate from '@cycle/isolate'
import { Location } from 'history'
import { Reducer, StateSource } from 'cycle-onionify'

import { renderMenu } from './menu'
import StateComponent from './state'
import RedirectComponent from './redirect'
import CombineComponent from './combine'
import MergeComponent from './merge'
import ListComponent from './list'
import DefaultComponent from './default'
import DragComponent from './drag'
import HttpComponent from './http'
import CarouselComponent from './carousel'
import CarouselStateComponent from './carousel.state'


import '../scss/styles.scss'
import Logger from './logger'
import { buffer}  from './xstream.extra'
import { HTTPSource, RequestInput } from '@cycle/http'

interface Component extends Object {
	onion?: Stream<Reducer<State>>
	DOM?: Stream<VNode>
	Log?: Stream<string>
	History?: Stream<string>
  HTTP: Stream<RequestInput>
}

interface State { }

interface Sinks {
	DOM: Stream<VNode>
	onion: Stream<Reducer<State>>
	History: Stream<string>
	Log: Stream<string>
  HTTP: Stream<RequestInput>
}

interface Sources {
	DOM: DOMSource
	History: Stream<Location>
	onion: StateSource<State>
  HTTP: HTTPSource,
}

function App(sources: Sources): Sinks {

	const path$: Stream<string> =
		sources.History
			.map(({pathname}) => pathname)

	const menuVDom = renderMenu()
	const menuDom$ = xs.of(menuVDom)

	const menuHistory$: Stream<string> =
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
				case '/combine':
					return CombineComponent(sources)
				case '/merge':
					return MergeComponent(sources)
				case '/redirect':
					return RedirectComponent(sources)
				case '/state':
					return isolate(StateComponent)(sources)
				case '/list':
					return isolate(ListComponent)(sources)
				case '/drag':
					return DragComponent(sources)
        case '/http':
          return HttpComponent(sources)
				case '/carousel':
					return CarouselComponent(sources)
				case '/carousel-state':
					return isolate(CarouselStateComponent)(sources)
				default:
					return DefaultComponent(sources)
			}
		})

	const componentDom$: Stream<VNode> =
		componentSinks$.map(componentSinks => componentSinks.DOM || xs.empty())
			.flatten()
			.map(dom => div('.component', dom))
			.startWith(undefined)

	const componentOnion$: Stream<Reducer<State>> =
		componentSinks$.map(componentSinks => componentSinks.onion || xs.empty())
			.flatten()

	const componentLog$: Stream<string> =
		componentSinks$.map(componentSinks => componentSinks.Log || xs.empty())
			.flatten()

	const componentHistory$: Stream<string> =
		componentSinks$.map(componentSinks => componentSinks.History || xs.empty())
			.flatten()

  const componentHttp$: Stream<RequestInput> =
    componentSinks$.map(componentSinks => componentSinks.HTTP || xs.empty())
      .flatten()


	// logging... AOP for anything none isolated (not super useful perhaps)
	const loggerLog$ = Logger(sources).Log

	// merge those logs with all child logs
	const appLog$ =
		xs.merge(
			loggerLog$,
			componentLog$,
		)

	// merge history
		const appHistory$ =
			xs.merge(
				menuHistory$,
				componentHistory$,
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
		History: appHistory$,
		Log: explodedBuffered$,
    HTTP: componentHttp$,
	}
}

export default App
