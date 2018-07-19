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

const routeStack: RouteStack = {
  routes: [],
  renderError: function(viewElement: HTMLElement, params?: any) {
    if (params.code == "404") {
      viewElement.innerHTML = `
        <h2>404 Error</h2>
        <pre>${ JSON.stringify(params) }</pre>
        <a href="${getUrl(routeStack, 'home')}">Go Back Home</a>
      `
    } else if (params.code == "403") {
      viewElement.innerHTML = `
        <h2>403 Forbidden Error</h2>
        <pre>${ JSON.stringify(params) }</pre>
        <a href="${getUrl(routeStack, 'home')}">Go Back Home</a>
      `
    } else {
      viewElement.innerHTML = `
        <h2>Unspecified Error</h2>
        <pre>${ JSON.stringify(params) }</pre>
        <a href="${getUrl(routeStack, 'home')}">Go Back Home</a>
      `
    }
  },
}

addRoute(
  routeStack,
  "home",
  "/",
  function (params: any, context: WeekendsWebAppContext) {
    return Promise.all([
      context.db.getAll('authors').then((authors: any[]) => {
        authors.forEach((author) => {
          context.actions.content.putContent('authors', author.id, author)
        })
      }),
      context.db.getAll('articles').then((articles: any[]) => {
        articles.forEach((article) => {
          context.actions.content.putContent('articles', article.id, article)
        })
      }),
    ])
  },
  function (
    viewElement: HTMLElement,
    params: any,
    appState: WeekendsWebAppState,
    context: WeekendsWebAppContext
  ) {

    const entries = []

    const articles = Object.keys(appState.content.articles).map((articleId: string) => {
      return appState.content.articles[articleId]
    })

    const authors = Object.keys(appState.content.authors).map((author_id: string) => {
      return appState.content.authors[author_id]
    })

    articles.sort((a, b) => {
      return a.publication_date.localeCompare(b.publication_date) * -1
    })
    authors.sort((a, b) => {
      return a.full_name.localeCompare(b.full_name)
    })

    const t_ = context.localize.translate
    const formatDate = context.localize.formatDate
    const formatNumber = context.localize.formatNumber
    const formatCurrency = context.localize.formatCurrency
    const formatPercentage = context.localize.formatPercentage
    const formatStorageSize = context.localize.formatStorageSize

    const articlesRender = articles.map((article: any) => {
      const author = appState.content.authors[article.author_id]

      return `
        <li><a href="${getUrl(routeStack, 'entry', {slug: article.id})}">
          ${t_(
            'home_page.article_line',
            {
              title: article.title, author_name: author.full_name,
              publication_date: formatDate(article.publication_date, 'full'),
            }
          )}
        </a></li>
      `
    })

    const authorsRender = authors.map((author: any) => {
      return `
        <li><a href="${getUrl(routeStack, 'author', {id: author.id})}">
          ${author.full_name}
        </a></li>
      `
    })
    
    viewElement.innerHTML = `
      <h2>${t_('home_page.title')}</h2>
      <p>${t_('home_page.counter', {count: appState.counter.count})}</p>
      <p>${formatNumber(103021982309821)}</p>
      <p>${formatStorageSize(10302198321)}</p>
      <p>${formatStorageSize(1030219, 'full-reduce')}</p>
      <p>${formatStorageSize(10302)}</p>
      <p>${formatStorageSize(12)}</p>
      <p>${formatCurrency(103021982, "AUD", "abbr-thousands")}</p>
      <p>${formatCurrency(103021302, "AUD", "abbr-thousands")}</p>
      <p>${formatCurrency(108221302, "AUD", "abbr-thousands")}</p>
      <p>${formatCurrency(1302, "AUD", "abbr-thousands")}</p>
      <p>${formatPercentage(0.20)}</p>
      <ul>
        ${articlesRender.join('\n')}
      </ul>
      <hr/>
      <ul>
        ${authorsRender.join('\n')}
      </ul>
      <a href="${getUrl(routeStack, 'about')}">${t_('about_page.title')}</a>
      <a href="https://www.google.com">${t_('home_page.google_link')}</a>
    `
  }
)

addRoute(routeStack,
  "about",
  "/about/",
  function (params: any) {
    return new Promise((resolve, reject) => {
      window.setTimeout(resolve, 1000)
    })
  },
  function (
    viewElement: HTMLElement,
    params: any,
    appState: WeekendsWebAppState,
    context: WeekendsWebAppContext
  ) {
    const t_ = context.localize.translate

    viewElement.innerHTML = `
      <h2>${t_("about_page.title")}</h2>
      <p>${t_('home_page.counter', {count: appState.counter.count})}</p>
      <a href="${getUrl(routeStack, 'home')}">${t_('home_page.title')}</a>
    `
  }
)

addRoute(routeStack,
  "entry",
  "/entry/:slug/",
  function (params: any, context: WeekendsWebAppContext) {
    return context.db.getByKey('articles', params.slug)
      .then((article: any) => {
        context.actions.content.putContent('articles', article.id, article)
        return context.db.getByKey('authors', article.author_id)
      }).then((author: any) => {
        context.actions.content.putContent('authors', author.id, author)
      })
  },
  function (
    viewElement: HTMLElement,
    params: any,
    appState: WeekendsWebAppState,
    context: WeekendsWebAppContext
  ) {
    const {slug} = params
    const article = appState.content.articles[params.slug]
    const author = appState.content.authors[article.author_id]
    const t_ = context.localize.translate
    const fdtUTC = context.localize.formatDateTimeUTC

    viewElement.innerHTML = `
      <h2>${article.title}</h2>
      <p>By <a href="${getUrl(routeStack, 'author', {id: author.id})}">${author.full_name}</a></p>
      <p>${fdtUTC(article.publication_date, 'abbr-local')}</p>
      <p>${t_('home_page.counter', {count: appState.counter.count})}</p>
      <p>${article.content}</p>
      <a href="${getUrl(routeStack, 'home')}">${t_('home_page.title')}</a>
    `
  }
)


addRoute(routeStack,
  "author",
  "/author/:id/",
  function (params: any, context: WeekendsWebAppContext) {
    return context.db.getByKey('authors', params.id)
      .then((author: any) => {
        context.actions.content.putContent('authors', author.id, author)

        const query = {
          store: 'articles',
          filters: [
            { key: 'author_id', lookup: 'equals', value: author.id, },
            // { key: 'publication_date', lookup: 'lt', value: '2017-01-01', },
          ]
        }

        return context.db.query(query)
      }).then((articles: any) => {
        articles.forEach((article: any) => {
          context.actions.content.putContent('articles', article.id, article)
        })
      })
  },
  function (
    viewElement: HTMLElement,
    params: any,
    appState: WeekendsWebAppState,
    context: WeekendsWebAppContext
  ) {
    const {id} = params
    const author = appState.content.authors[id]
    const t_ = context.localize.translate
    const formatDate = context.localize.formatDate

    const articles = Object.keys(appState.content.articles).map((articleId: string) => {
      return appState.content.articles[articleId]
    }).filter((article) => {
      return article.author_id == author.id
    })

    articles.sort((a, b) => {
      return a.publication_date.localeCompare(b.publication_date) * -1
    })

    const articlesRender = articles.map((article: any) => {
      const author = appState.content.authors[article.author_id]

      return `
        <li><a href="${getUrl(routeStack, 'entry', {slug: article.id})}">
          ${t_(
            'home_page.article_line',
            {
              title: article.title, author_name: author.full_name,
              publication_date: formatDate(article.publication_date, 'full'),
            }
          )}
        </a></li>
      `
    }).join('')
    
    viewElement.innerHTML = `
      <h2>${author.full_name}</h2>
      <ul>${articlesRender}</ul>
      <a href="${getUrl(routeStack, 'home')}">${t_('home_page.title')}</a>
    `
  }
)


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

    const countElement = document.querySelector('.count')
    const incrementButton = document.querySelector('.increment')
    const decrementButton = document.querySelector('.decrement')

    incrementButton.addEventListener('click', actionsBundle.counter.incrementCount)
    decrementButton.addEventListener('click', actionsBundle.counter.decrementCount)
    
    store.subscribe(() => {
      const state = store.getState()
      KeyValueStorage.set("counter", state.counter)
      countElement.textContent = state.counter.count.toString()
    })

    const context = {
      db,
      localize: new LocalizeContext('en-AU', {
        en: enTranslation,
      }),
      actions: actionsBundle,
    }

    initializeRenderer(routeStack, viewElement, store, actionsBundle, context)
    initializeRouter(routeStack, store, actionsBundle, context)
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






