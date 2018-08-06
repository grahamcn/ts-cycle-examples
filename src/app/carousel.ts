import xs, { Stream } from 'xstream'
import { div, VNode, h2, nav, button, ul, li, DOMSource,  } from '@cycle/dom'
import { request } from 'http';

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

	const slideIndexOffset$: Stream<number> =
		sources.DOM
			.select('.goToslide')
			.events('click')
			.map(event => {
				const target: EventTarget = event.target
				return parseInt(target['dataset'].dataSlideOffset)
			})

	const nextOffset$ = sources.DOM.select('.next').events('click').mapTo(1)
	const prevOffset$ = sources.DOM.select('.prev').events('click').mapTo(-1)

	// any click on those will reset the timer, so let's create that stream of clicks.
	const carouselControlClick$: Stream<any> =
		xs.merge(
			slideIndexOffset$,
			prevOffset$,
			nextOffset$,
		)

	const timerOffset$: Stream<number> =
		carouselControlClick$
			.startWith(0)
			.map(() =>
				xs.periodic(2000)
			)
			.flatten()
			.mapTo(1)

	const selectedIndex$ =
		xs.merge(
			timerOffset$,
			slideIndexOffset$,
			nextOffset$,
			prevOffset$,
		).fold((acc, offset) => {
			const requestedSlide = acc + offset

			if (requestedSlide < 0) {
				return slidesData.length - 1
			} else if (requestedSlide > slidesData.length - 1) {
				return 0
			}

			return requestedSlide
		}, 0)

	const vdom$: Stream<VNode> =
		selectedIndex$
			.map(selectedIndex =>
				div('.carousel', [
					...slidesData
						.map((slide, index) =>
							index !== selectedIndex ? undefined :
								div(`.slide .slide-${index}`, {
									style: {
										backgroundColor: 'grey',
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										position: 'absolute',
										width: '100%',
										height: '200px',
										transition: 'opacity 500ms', // animation stuff starts here
										opacity: 0.01,
										delayed: {
											opacity: 1,
										},
										remove: {
											opacity: 0,
										}
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
									button(`.goToslide offset-${selectedIndex - index}`, {
										dataset: {
											dataSlideOffset: (selectedIndex - index) * -1
										}
									}, index)
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
