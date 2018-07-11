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
//   Translation Functions
//   Dates & Times
//   Numeric Formats
//
// Application State
//   In Memory (lost every time there is a refresh) READY
//   Local Database (IndexedDB)
//   Local Storage (localStorage, sessionStorage)
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

import allAuthors from './test-data/authors'
import allArticles from './test-data/articles'
import ContentStateBundle from './test-data/state'

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
    appState: WeekendsWebAppState
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

    const articlesRender = articles.map((article: any) => {
      const author = appState.content.authors[article.author_id]

      return `
        <li><a href="${getUrl(routeStack, 'entry', {slug: article.id})}">
          ${article.title} - by ${author.full_name} on ${article.publication_date}
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
      <h2>This is the home page</h2>
      <p>The count is ${appState.counter.count}</p>
      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam hendrerit suscipit dui vitae aliquet. Nullam suscipit varius erat eu sagittis. Ut efficitur bibendum nibh, in faucibus urna interdum ut. Duis faucibus tellus id suscipit vulputate. Nunc nunc magna, egestas id gravida eget, scelerisque quis odio. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Curabitur vitae massa eu dui bibendum aliquam. </p>
      <ul>
        ${articlesRender.join('\n')}
      </ul>
      <hr/>
      <ul>
        ${authorsRender.join('\n')}
      </ul>
      <a href="${getUrl(routeStack, 'about')}">About</a>
      <a href="https://www.google.com">Go To Google</a>
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
    appState: WeekendsWebAppState
  ) {
    viewElement.innerHTML = `
      <h2>This is the about page</h2>
      <p>The count is ${appState.counter.count}</p>
      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam hendrerit suscipit dui vitae aliquet. Nullam suscipit varius erat eu sagittis. Ut efficitur bibendum nibh, in faucibus urna interdum ut. Duis faucibus tellus id suscipit vulputate. Nunc nunc magna, egestas id gravida eget, scelerisque quis odio. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Curabitur vitae massa eu dui bibendum aliquam. </p>
      <a href="${getUrl(routeStack, 'home')}">Home</a>
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
    appState: WeekendsWebAppState
  ) {
    const {slug} = params
    const article = appState.content.articles[params.slug]
    const author = appState.content.authors[article.author_id]
    
    viewElement.innerHTML = `
      <h2>${article.title}</h2>
      <p>By <a href="${getUrl(routeStack, 'author', {id: author.id})}">${author.full_name}</a></p>
      <p>The count is ${appState.counter.count}</p>
      <p>${article.content}</p>
      <a href="${getUrl(routeStack, 'home')}">Home</a>
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
    appState: WeekendsWebAppState
  ) {
    const {id} = params
    const author = appState.content.authors[id]

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
          ${article.title} - by ${author.full_name} - ${article.publication_date}
        </a></li>
      `
    }).join('')
    
    viewElement.innerHTML = `
      <h2>${author.full_name}</h2>
      <ul>${articlesRender}</ul>
      <a href="${getUrl(routeStack, 'home')}">Home</a>
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
      actions: actionsBundle,
    }

    initializeRenderer(routeStack, viewElement, store, actionsBundle)
    initializeRouter(routeStack, store, actionsBundle, context)
  })
})



function initializeData() {
  const {AddStore, AddIndex} = DatabaseStorage.MigrationType
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


  let db: DB

  return DatabaseStorage.deleteDb("WWAData")
    .then(() => {
      db = DatabaseStorage.initializeDb("WWAData", migrations)
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






