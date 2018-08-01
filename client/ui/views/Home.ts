import {
  WeekendsWebAppContext, WeekendsWebAppState, WeekendsWebAppActions
} from '../../AppState'

import {ViewBundle} from '../../platform/Renderer'

function preload (params: any, context: WeekendsWebAppContext) {
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
}

function render (
  viewElement: Element,
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

  const articlesRender = articles.map((article: any) => {
    const author = appState.content.authors[article.author_id]

    return `
      <li><a href="${context.getUrl('entry', {slug: article.id})}">
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
      <li><a href="${context.getUrl('author', {id: author.id})}">
        ${author.full_name}
      </a></li>
    `
  })
  
  viewElement.innerHTML = `
    <h2>${t_('home_page.title')}</h2>
    <p>${t_('home_page.counter', {count: appState.counter.count})}</p>
    <ul>
      ${articlesRender.join('\n')}
    </ul>
    <hr/>
    <ul>
      ${authorsRender.join('\n')}
    </ul>
    <a href="${context.getUrl('about')}">${t_('about_page.title')}</a>
    <a href="https://www.google.com">${t_('home_page.google_link')}</a>
  `
}

function destroy (
) {
}

const viewBundle: ViewBundle<WeekendsWebAppState, WeekendsWebAppContext, void> = {
  viewId: "home",
  preload,
  initialize: render,
  update: render,
  destroy,
}

export default viewBundle
