import { run } from '@cycle/run'
import { makeDOMDriver } from '@cycle/dom'

import App from './app/app'

const drivers = {
	DOM: makeDOMDriver('#app')
}

run(App, drivers)
