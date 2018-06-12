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



document.addEventListener('DOMContentLoaded', function (event) {
  updateView()

  document.body.addEventListener('click', function (event) {
    if (event.target && (event.target as HTMLElement).tagName == "A") {
      const anchor = (event.target as HTMLAnchorElement)
      const root = window.location.origin
      if (anchor.href && anchor.href.indexOf(root) == 0) {
        event.preventDefault()
        window.history.pushState({}, "", anchor.href)
        updateView()
      }
    }
  })
})



function updateView () {
  const viewElement = document.getElementById('view')

  const currentLocation = window.location.pathname

  switch (currentLocation) {
    case "/":
      viewElement.innerHTML = `
        <h2>This is the home page</h2>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam hendrerit suscipit dui vitae aliquet. Nullam suscipit varius erat eu sagittis. Ut efficitur bibendum nibh, in faucibus urna interdum ut. Duis faucibus tellus id suscipit vulputate. Nunc nunc magna, egestas id gravida eget, scelerisque quis odio. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Curabitur vitae massa eu dui bibendum aliquam. </p>
        <a href="/about">About</a>
        <a href="https://www.google.com">Go To Google</a>
      `
      break;
    case "/about":
    case "/about/":
      viewElement.innerHTML = `
        <h2>This is the about page</h2>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam hendrerit suscipit dui vitae aliquet. Nullam suscipit varius erat eu sagittis. Ut efficitur bibendum nibh, in faucibus urna interdum ut. Duis faucibus tellus id suscipit vulputate. Nunc nunc magna, egestas id gravida eget, scelerisque quis odio. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Curabitur vitae massa eu dui bibendum aliquam. </p>
        <a href="/">Home</a>
      `
      break;
  }
}




