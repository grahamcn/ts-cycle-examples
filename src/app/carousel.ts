import xs, { Stream } from 'xstream'
import { div, VNode, nav, button, ul, li, DOMSource } from '@cycle/dom'

interface Sinks {
	DOM: Stream<VNode>,
}

interface Sources {
	DOM: DOMSource
}

const slidesData = [
	'cats',
	'elephants',
	'geese',
	'gnu',
	'marzipan',
]

// this could be a good example to refactor to MVI

function Carousel(sources: Sources): Sinks {
	const directOffset$: Stream<number> =
		sources.DOM
			.select('.goToslide')
			.events('click')
			.map(event => {
				const target: EventTarget = event.target
				return parseInt(target['dataset'].dataSlideOffset)
			})

	const nextOffset$: Stream<number> = sources.DOM.select('.next').events('click').mapTo(1)
	const prevOffset$: Stream<number> = sources.DOM.select('.prev').events('click').mapTo(-1)

	// any click on those will reset the timer, so let's create that stream of clicks.
	const carouselControlClick$: Stream<any> =
		xs.merge(
			directOffset$,
			prevOffset$,
			nextOffset$,
		)

	const timerOffset$: Stream<number> =
		carouselControlClick$
			.startWith(0)
			.map(() => xs.periodic(3000))
			.flatten() // switch latest, in terms of flattening strategies
			.mapTo(1)

	const slideIndex$: Stream<number> =
		xs.merge(
			timerOffset$,
			directOffset$,
			nextOffset$,
			prevOffset$,
		).fold((acc, offset) => {
			const requestedSlide = acc + offset
			// fix and return any boundry breaches
			if (requestedSlide < 0) {
				return slidesData.length - 1
			} else if (requestedSlide > slidesData.length - 1) {
				return 0
			}

			return requestedSlide
		}, 0) // start with index 0

	// the animations work on entry & exit - one slide div is displayed at a given time
	const vdom$: Stream<VNode> =
		slideIndex$
			.map(slideIndex =>
				div('.carousel', [
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
					nav([
						button('.prev', 'Prev'),
						ul(
							slidesData.map((slide, index) =>
								li(
									// I've had to change the class too as the dataset change does not
									// get picked up / cause a re-render. that's quite interesting, and
									// potentially useful to know
									button(`.goToslide offset-${slideIndex - index}`, {
										style: {
											backgroundColor: slideIndex === index ? '#b2f7bb' : 'initial'
										},
										dataset: {
											dataSlideOffset: (slideIndex - index) * -1
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
	}
}

export default Carousel
