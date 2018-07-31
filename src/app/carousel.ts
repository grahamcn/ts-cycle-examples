import xs, { Stream } from 'xstream'
import { div, VNode, h2, nav, button, ul, li, DOMSource,  } from '@cycle/dom'

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

function Carousel(sources: Sources): Sinks {

	// reduce to a +/- someting from previos value
	const selectedIndex$: Stream<string> =
		sources.DOM
			.select('.goToslide')
			.events('click')
			.map(event => {
				const target: EventTarget = event.target
				return target['dataset'].dataSlideIndex
			}).startWith('0')

	// timer gives +1
	// next gives +1
	// prev gives -1
	// selected gives +/- some value
	// merge that to reducee, start with 0

	const vdom$: Stream<VNode> =
		selectedIndex$
			.map(selectedIndex =>
				div('.carousel', [
					...slidesData
						.map((slide, index) =>
							index.toString() !== selectedIndex ? undefined :
								div(`.slide .slide-${index}`, {
									style: {
										backgroundColor: 'grey',
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										position: 'absolute',
										width: '100%',
										height: '200px',
										transition: 'opacity 500ms',
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
									button('.goToslide', {
										dataset: {
											dataSlideIndex: index.toString()
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
