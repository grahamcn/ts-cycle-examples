import { Stream } from 'xstream'

export function makeLogDriver() {
	// a write only driver
	return msg$ =>
		msg$.addListener({
			next: msg => console.log(msg)
		})
}
