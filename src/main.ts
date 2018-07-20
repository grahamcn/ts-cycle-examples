import { run } from '@cycle/run'
import { makeDOMDriver } from '@cycle/dom'
import { makeHTTPDriver } from '@cycle/http'
import { makeHistoryDriver } from '@cycle/history'
import onionify from 'cycle-onionify'

import App from './app/app'

const drivers = {
	DOM: makeDOMDriver('#app'),
	HTTP: makeHTTPDriver(),
	History: makeHistoryDriver(),
}

const wrappedMain = onionify(App)

run(wrappedMain, drivers)
