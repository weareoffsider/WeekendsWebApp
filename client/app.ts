// TODO: build WeekendsWebApp
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
import createStateStore, {CounterStateBundle} from './platform/State'
import {
  WeekendsWebAppState, WeekendsWebAppActions,
  WeekendsWebAppContext,
} from './AppState'

import {DB, DatabaseStorage, KeyValueStorage} from './platform/Persistence'
import LocalizeContext from './platform/Localize'

import allAuthors from './test-data/authors'
import allArticles from './test-data/articles'
import ContentStateBundle from './test-data/state'


const enTranslation = require('./locales/en.json')

const routeStack: RouteStack = {rootPath: "", routes: []}

addRoute(routeStack, "home", "/")
addRoute(routeStack, "entry", "/entry/:slug/")
addRoute(routeStack, "about", "/about/")
addRoute(routeStack, "author", "/author/:id/")

import footerChrome from './ui/chrome/Counter'
import navChrome from './ui/chrome/Nav'
import homeView from './ui/views/Home'
import errorsView from './ui/views/Errors'

document.addEventListener('DOMContentLoaded', function (event) {
  const viewElement = document.getElementById('view')
  const initialCounter = KeyValueStorage.get("counter", CounterStateBundle.initial)

  initializeData().then((db) => {
    CounterStateBundle.initial = initialCounter
    const {store, actionsBundle} = createStateStore<WeekendsWebAppState, WeekendsWebAppActions>([
      CounterStateBundle,
      RouterStateBundle,
      ContentStateBundle,
    ])

    store.subscribe(() => {
      const state = store.getState()
      KeyValueStorage.set("counter", state.counter)
    })

    const context = {
      db,
      localize: new LocalizeContext('en-AU', {
        en: enTranslation,
      }),
      actions: actionsBundle,
      getUrl: (name: string, params?: any) => {
        return getUrl(routeStack, name, params)
      }
    }

    const chromeBundles = [
      navChrome,
      footerChrome,
    ]

    const viewBundles = [
      errorsView,
      homeView,
    ]

    initializeRenderer(routeStack, chromeBundles, viewBundles, viewElement, store, actionsBundle, context)
    initializeRouter(routeStack, viewBundles, store, actionsBundle, context)
  })
})



function initializeData() {
  const {AddStore, AddIndex} = DatabaseStorage.MigrationType
  const {FieldType, RelationshipType} = DatabaseStorage
  const migrations = [
    // VERSION 1
    {
      actions: [
        {type: AddStore, storeName: "authors", storeOpts: {keyPath: "id"}},
        {type: AddStore, storeName: "articles", storeOpts: {keyPath: "id"}},
        {type: AddIndex, storeName: "articles", fieldName: "author_id"},
        {type: AddIndex, storeName: "articles", fieldName: "publication_date"},
        {type: AddIndex, storeName: "articles", fieldName: "title"},
      ],
    },
    // VERSION 2
    // {
    //   actions: [
    //     {type: AddStore, storeName: "categories"},
    //     {type: AddStore, storeName: "pages"},
    //     {type: AddIndex, storeName: "articles", fieldName: "category_ids", indexOpts: {multiEntry: true}}
    //   ],
    // }
  ]

  const schema = {
    name: "WWAData",
    migrations,
    stores: {
      "authors": {
        name: "authors",
        fields: {
          "id": {indexed: true, type: FieldType.String},
          "full_name": {indexed: false, type: FieldType.String},
        },
        relationships: {
          "articles": {type: RelationshipType.HasMany, thisKey: "id", storeName: "articles", storeKey: "author_id"},
        }
      }, 
      "articles": {
        name: "articles",
        fields: {
          "id": {indexed: true, type: FieldType.String},
          "author_id": {indexed: true, type: FieldType.String},
          "title": {indexed: true, type: FieldType.String},
          "publication_date": {indexed: true, type: FieldType.Date},
          "content": {type: FieldType.String},
        },
        relationships: {
          "author": {type: RelationshipType.BelongsTo, thisKey: "author_id", storeName: "authors", storeKey: "id"},
        }
      },
    }
  }

  let db: DB

  return DatabaseStorage.deleteDb("WWAData")
    .then(() => {
      db = DatabaseStorage.initializeDb(schema)
      return Promise.all(
        allAuthors.map((a) => {
          return db.save("authors", a)
        }).concat(
          allArticles.map((a) => {
            return db.save("articles", a)
          })
        )
      )
    }).then(() => {
      return db
    })
}






