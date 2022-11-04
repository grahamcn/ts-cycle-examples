import xs, { Stream } from 'xstream'
import { div, VNode, DOMSource } from '@cycle/dom'
import { HTTPSource, RequestInput } from '@cycle/http'

interface Sinks {
	DOM: Stream<VNode>,
  HTTP: Stream<RequestInput>
}

interface Sources {
	DOM: DOMSource
  HTTP: HTTPSource,
}

function Http(sources: Sources): Sinks {
  const response$ =
    sources.HTTP
      .select('my-data')
      .flatten()

  const vdom$ =
    response$
      .map((response: any) => response.body)
      .map(data => div(JSON.stringify(data, null, 2)))
      .startWith(div('loading...'));

  const request$ =
    xs.of({
      url: 'https://rickandmortyapi.com/api/character/2',
      'category': 'my-data',
    });

	return {
		DOM: vdom$,
		HTTP: request$,
	}
}

export default Http
