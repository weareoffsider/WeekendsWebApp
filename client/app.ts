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

const routeStack: RouteStack = {routes: []}

addRoute(routeStack, "home", "/")
addRoute(routeStack, "entry", "/entry/:slug/")
addRoute(routeStack, "about", "/about/")
addRoute(routeStack, "author", "/author/:id/")

// addRoute(routeStack,
//   "about",
//   "/about/",
//   function (params: any) {
//     return new Promise((resolve, reject) => {
//       window.setTimeout(resolve, 1000)
//     })
//   },
//   function (
//     viewElement: HTMLElement,
//     params: any,
//     appState: WeekendsWebAppState,
//     context: WeekendsWebAppContext
//   ) {
//     const t_ = context.localize.translate

//     viewElement.innerHTML = `
//       <h2>${t_("about_page.title")}</h2>
//       <p>${t_('home_page.counter', {count: appState.counter.count})}</p>
//       <a href="${getUrl(routeStack, 'home')}">${t_('home_page.title')}</a>
//     `
//   }
// )

// addRoute(routeStack,
//   "entry",
//   "/entry/:slug/",
//   function (params: any, context: WeekendsWebAppContext) {
//     return context.db.getByKey('articles', params.slug)
//       .then((article: any) => {
//         context.actions.content.putContent('articles', article.id, article)
//         return context.db.getByKey('authors', article.author_id)
//       }).then((author: any) => {
//         context.actions.content.putContent('authors', author.id, author)
//       })
//   },
//   function (
//     viewElement: HTMLElement,
//     params: any,
//     appState: WeekendsWebAppState,
//     context: WeekendsWebAppContext
//   ) {
//     const {slug} = params
//     const article = appState.content.articles[params.slug]
//     const author = appState.content.authors[article.author_id]
//     const t_ = context.localize.translate
//     const fdtUTC = context.localize.formatDateTimeUTC

//     viewElement.innerHTML = `
//       <h2>${article.title}</h2>
//       <p>By <a href="${getUrl(routeStack, 'author', {id: author.id})}">${author.full_name}</a></p>
//       <p>${fdtUTC(article.publication_date, 'abbr-local')}</p>
//       <p>${t_('home_page.counter', {count: appState.counter.count})}</p>
//       <p>${article.content}</p>
//       <a href="${getUrl(routeStack, 'home')}">${t_('home_page.title')}</a>
//     `
//   }
// )


// addRoute(routeStack,
//   "author",
//   "/author/:id/",
//   function (params: any, context: WeekendsWebAppContext) {
//     return context.db.getByKey('authors', params.id)
//       .then((author: any) => {
//         context.actions.content.putContent('authors', author.id, author)

//         const query = {
//           store: 'articles',
//           filters: [
//             { key: 'author_id', lookup: 'equals', value: author.id, },
//             // { key: 'publication_date', lookup: 'lt', value: '2017-01-01', },
//           ]
//         }

//         return context.db.query(query)
//       }).then((articles: any) => {
//         articles.forEach((article: any) => {
//           context.actions.content.putContent('articles', article.id, article)
//         })
//       })
//   },
//   function (
//     viewElement: HTMLElement,
//     params: any,
//     appState: WeekendsWebAppState,
//     context: WeekendsWebAppContext
//   ) {
//     const {id} = params
//     const author = appState.content.authors[id]
//     const t_ = context.localize.translate
//     const formatDate = context.localize.formatDate

//     const articles = Object.keys(appState.content.articles).map((articleId: string) => {
//       return appState.content.articles[articleId]
//     }).filter((article) => {
//       return article.author_id == author.id
//     })

//     articles.sort((a, b) => {
//       return a.publication_date.localeCompare(b.publication_date) * -1
//     })

//     const articlesRender = articles.map((article: any) => {
//       const author = appState.content.authors[article.author_id]

//       return `
//         <li><a href="${getUrl(routeStack, 'entry', {slug: article.id})}">
//           ${t_(
//             'home_page.article_line',
//             {
//               title: article.title, author_name: author.full_name,
//               publication_date: formatDate(article.publication_date, 'full'),
//             }
//           )}
//         </a></li>
//       `
//     }).join('')
    
//     viewElement.innerHTML = `
//       <h2>${author.full_name}</h2>
//       <ul>${articlesRender}</ul>
//       <a href="${getUrl(routeStack, 'home')}">${t_('home_page.title')}</a>
//     `
//   }
// )


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






