import xs, { Stream } from 'xstream'
import { div, VNode, nav, button, ul, li, DOMSource, h2 } from '@cycle/dom'
import { StateSource, Reducer } from 'cycle-onionify'

interface State {
	slideIndex: number
}

interface Sinks {
	DOM: Stream<VNode>,
	onion: Stream<Reducer<State>>
}

interface Sources {
	DOM: DOMSource
	onion: StateSource<State>
}

const slidesData = [
	'1',
	'2',
	'3',
	'4',
	'5',
]

function CarouselState(sources: Sources): Sinks {
	const state$ = sources.onion.state$

	// map a click on goToSlide button to it's slide offset from current.
	const goToSlideClick$: Stream<number> =
		sources.DOM
			.select('.goToslide')
			.events('click')
			.map(event => {
				const target: EventTarget = event.target
				return parseInt(target['dataset'].dataSlideIndex)
			})

	// map click on next to +1, previosu to -1
  const nextClick$: Stream<MouseEvent> = sources.DOM.select('.next').events('click')
  const slidesClick$: Stream<MouseEvent> = sources.DOM.select('.slides').events('click')
  const prevClick$: Stream<MouseEvent> = sources.DOM.select('.prev').events('click')
  const mouseLeave$ = sources.DOM.select('.slide').events('mouseleave')

	// any click on those will reset the timer, so let's create that stream of clicks.
	const userInteraction$: Stream<any> =
		xs.merge(
			goToSlideClick$,
			nextClick$,
      prevClick$,
      slidesClick$,
      mouseLeave$,
		)

	// every 3 seconds, emit +1, restart the timer whenever the domInitiatedOffset stream emits
  // ie cancel when some user interation occurs.
	const timeInitiatedMove$: Stream<number> =
		userInteraction$
      .startWith(0)
      .map(() =>
        // each of those events starts the timer.
        // the timer firsing will increment the slide
        // the 'increment due to timer' stream is cancelled when the use mouseovers a slide
        // a mouseout user interaction restarts the timer
        xs.periodic(1500).endWhen(sources.DOM.select('.slide').events('mouseenter').take(1))
      )
      .flatten() // switch latest, in terms of flattening strategies

	// default reducer - set state to 0
	const defaultReducer$: Stream<Reducer<State>> =
		xs.of(function defaultReducer() {
			return {
				slideIndex: 0
			}
		})

	// add one reducer
	const addOneReducer$: Stream<Reducer<State>> =
		xs.merge(
			nextClick$,
      timeInitiatedMove$,
      slidesClick$,
		).map(() => function addOneReducer(prev) {
			return {
				slideIndex: prev.slideIndex + 1 === slidesData.length ?
					0 : prev.slideIndex + 1
			}
		})

	// subtract one reducer
	const subtractOneReducer$: Stream<Reducer<State>> =
		xs.merge(
			prevClick$,
		).map(() => function subtractOneReducer(prev) {
			return {
				slideIndex: prev.slideIndex - 1 < 0 ?
					slidesData.length - 1  : prev.slideIndex - 1
			}
		})

	// goto slide reducer
	const goToSlideReducer$: Stream<Reducer<State>> =
		xs.merge(
			goToSlideClick$,
		).map(slideIndex => function goToSlideReducer() {
			return {
				slideIndex,
			}
		})

	const carouselReducer$ =
		xs.merge(
			defaultReducer$,
			addOneReducer$,
			subtractOneReducer$,
			goToSlideReducer$,
		)

	// the animations work on entry & exit - one slide div is displayed at a given time
	const vdom$: Stream<VNode> =
		state$
			.map(({slideIndex}) =>
				div('.carousel', [
					h2('.header', 'Carousel'),
					div('.slides', [
						...slidesData
							.map((slide, index) =>
								index !== slideIndex ? undefined :
									div(`.slide .slide-${index}`, {
										style: {
											// basic formatting
											backgroundColor: 'grey',
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center',
											position: 'absolute',
											width: '100%',
											height: '200px',
											// required animation stuff starts from here
											transition: 'opacity 500ms',
											opacity: 0.01,
											delayed: {
												opacity: 1,
											},
											remove: {
												opacity: 0,
											}
											// end animation
										}
									}, slide)
							),
					]),
					nav([
						button('.prev', 'Prev'),
						ul(
							slidesData.map((slide, index) =>
								li(
									button(`.goToslide`, {
										attrs: {
											disabled: slideIndex === index,
										},
										style: {
											backgroundColor: slideIndex === index ? '#b2f7bb' : 'initial'
										},
										dataset: {
											dataSlideIndex: index.toString()
										}
									}, index + 1)
								)
							),
						),
						button('.next', 'Next'),
					])
				])
			)

	return {
		DOM: vdom$,
		onion: carouselReducer$,
	}
}

export default CarouselState
