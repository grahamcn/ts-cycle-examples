import xs, { Stream } from 'xstream';
import { div, VNode, ul, li, a, DOMSource } from '@cycle/dom'

import {containerMenuData, MenuItem} from './misc/constants'
import {getTargetHref} from './misc/helpers'

export interface Sources {
  DOM: DOMSource
}

export interface Sinks {
  DOM: Stream<VNode>,
  History: Stream<string>
}

// spits out a static menu from a static array
function ContainerMenu(sources): Sinks {

  const history$ =
    sources.DOM.select('.containerMenu__link')
      .events('click')
      .map(getTargetHref)

  const vdom$ =
    xs.of(containerMenuData)
      .map(data =>
        div('.containerMenu',
          ul('.containerMenu__list',
            data.map((menuItem: MenuItem) =>
              li('.containerMenu__item',
                a('.containerMenu__link', {
                  attrs: {
                    title: menuItem.title,
                    href: menuItem.url,
                  },
                }, menuItem.title
              )
            ))
          )
        )
      )

  return {
    DOM: vdom$,
    History: history$,
  }

}

export default ContainerMenu

