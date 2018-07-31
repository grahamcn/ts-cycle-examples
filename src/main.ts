import { run } from '@cycle/run'
import { makeDOMDriver } from '@cycle/dom'
import { makeHTTPDriver } from '@cycle/http'
import { makeHistoryDriver } from '@cycle/history'
import {makeLogDriver} from './drivers/log'
import onionify from 'cycle-onionify'

import App from './app'

const drivers = {
	DOM: makeDOMDriver('#app'),
	HTTP: makeHTTPDriver(),
	History: makeHistoryDriver(),
	Log: makeLogDriver(),
}

const wrappedMain = onionify(App)

run(wrappedMain, drivers)
