// TODO: build SeaTime
// Platform Layer
// Routing READY
//   Loading Transitions UNNECESSARY FOR NOW
//
// Utilities
//   Common DOM Operations
//   Math Operations
//
// Internationalization (i18n) / Localization (l10n)
//   Translation Functions DONE
//   Dates & Times DONE
//   Numeric Formats DONE
//
// Application State
//   In Memory (lost every time there is a refresh) READY
//   Local Database (IndexedDB) READY
//   Local Storage (localStorage, sessionStorage) READY
//
// Notifications
// Location Service
// Sound
//
// API Communication Layer
//   get requests
//   post requests
//   websockets
//   file uploads


import {
  RouteStack, addRoute, getUrl, initializeRouter,
  DataNotFoundError, DataForbiddenError,
} from './platform/Routing'

import initializeRenderer from './platform/Renderer'
import RouterStateBundle from './platform/Routing/state'
import createStateStore from './platform/State'
import {
  SeaTimeState, SeaTimeActions,
  SeaTimeContext,
} from './AppState'

import {DB, DatabaseStorage, KeyValueStorage} from './platform/Persistence'
import LocalizeContext from './platform/Localize'

const enTranslation = require('./locales/en.json')

const routeStack: RouteStack = {rootPath: "", routes: []}

addRoute(routeStack, "home", "/")

import homeView from './ui/views/Home'
import errorsView from './ui/views/Errors'

document.addEventListener('DOMContentLoaded', function (event) {
  const viewElement = document.getElementById('view')
  const {store, actionsBundle} = createStateStore<SeaTimeState, SeaTimeActions>([
    RouterStateBundle,
  ])

  const context = {
    localize: new LocalizeContext('en-AU', {
      en: enTranslation,
    }),
    actions: actionsBundle,
    getUrl: (name: string, params?: any) => {
      return getUrl(routeStack, name, params)
    }
  }

  const chromeBundles: any = []

  const viewBundles = [
    errorsView,
    homeView,
  ]

  initializeRenderer(routeStack, chromeBundles, viewBundles, viewElement, store, actionsBundle, context)
  initializeRouter(routeStack, viewBundles, store, actionsBundle, context)
})

