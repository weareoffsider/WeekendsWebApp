// TODO: build WeekendsWebApp
// Platform Layer
// Routing
//   Loading Transitions
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
//   In Memory (lost every time there is a refresh)
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


import {RouteStack, addRoute, getUrl, initializeRouter} from './platform/Routing'


const routeStack: RouteStack = {
  routes: [],
}

addRoute(
  routeStack,
  "home",
  "/",
  function (params: any) {
    return Promise.resolve(true)
  },
  function (viewElement: HTMLElement) {
    viewElement.innerHTML = `
      <h2>This is the home page</h2>
      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam hendrerit suscipit dui vitae aliquet. Nullam suscipit varius erat eu sagittis. Ut efficitur bibendum nibh, in faucibus urna interdum ut. Duis faucibus tellus id suscipit vulputate. Nunc nunc magna, egestas id gravida eget, scelerisque quis odio. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Curabitur vitae massa eu dui bibendum aliquam. </p>
      <ul>
        <li><a href="${getUrl(routeStack, 'entry', {slug: "entry-one"})}">Entry One</a></li>
        <li><a href="${getUrl(routeStack, 'entry', {slug: "entry-two"})}">Entry Two</a></li>
        <li><a href="${getUrl(routeStack, 'entry', {slug: "entry-three"})}">Entry Three</a></li>
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
  function (viewElement: HTMLElement) {
    viewElement.innerHTML = `
      <h2>This is the about page</h2>
      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam hendrerit suscipit dui vitae aliquet. Nullam suscipit varius erat eu sagittis. Ut efficitur bibendum nibh, in faucibus urna interdum ut. Duis faucibus tellus id suscipit vulputate. Nunc nunc magna, egestas id gravida eget, scelerisque quis odio. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Curabitur vitae massa eu dui bibendum aliquam. </p>
      <a href="${getUrl(routeStack, 'home')}">Home</a>
    `
  }
)


addRoute(routeStack,
  "entry",
  "/entry/:slug/",
  function (params: any) {
    return new Promise((resolve, reject) => {
      window.setTimeout(resolve, 3000)
    })
  },
  function (viewElement: HTMLElement, params: any) {
    const {slug} = params
    viewElement.innerHTML = `
      <h2>This is an entry page - ${slug}</h2>
      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam hendrerit suscipit dui vitae aliquet. Nullam suscipit varius erat eu sagittis. Ut efficitur bibendum nibh, in faucibus urna interdum ut. Duis faucibus tellus id suscipit vulputate. Nunc nunc magna, egestas id gravida eget, scelerisque quis odio. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Curabitur vitae massa eu dui bibendum aliquam. </p>
      <a href="${getUrl(routeStack, 'home')}">Home</a>
    `
  }
)


document.addEventListener('DOMContentLoaded', function (event) {
  const viewElement = document.getElementById('view')
  routeStack.viewElement = viewElement
  initializeRouter(routeStack)
})









