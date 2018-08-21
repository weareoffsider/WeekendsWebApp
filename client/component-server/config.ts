import {
  UniversalComponentConfig,
} from 'universal-component-server'

const context = (require as any).context('../ui', true, /\.(js|ts|tsx)$/)
const ucsConfig = new UniversalComponentConfig(context)

ucsConfig.addComponentRunner({
  name: "html-functions",
  matcher: "./**/*.html.ts",
  getTestData: (path) => {
    const keys = context.keys()
    const testPath = path.replace('.html.ts', '.data.ts')

    if (keys.indexOf(testPath) != -1) {
      return context(testPath)
    } else {
      return {default: {}}
    }
  },
  renderServer: (componentModule, data) => {
    return componentModule.default(data)
  },
  renderClient: (container, componentModule, data, path) => {
    const keys = context.keys()
    const clientPath = path.replace('.html.ts', '.client.ts')

    if (keys.indexOf(clientPath) != -1) {
      return context(clientPath).default(container.childNodes[0], data)
    }

    return null
  },
})


ucsConfig.addComponentRunner({
  name: "react-components",
  matcher: "./**/*.react.tsx",
  getTestData: (path) => {
    const keys = context.keys()
    const testPathTsx = path.replace('.react.tsx', '.data.tsx')
    const testPathTs = path.replace('.react.tsx', '.data.ts')

    if (keys.indexOf(testPathTs) != -1) {
      return context(testPathTs)
    } else if (keys.indexOf(testPathTsx) != -1) {
      return context(testPathTsx)
    } else {
      return {default: {}}
    }
  },
  renderServer: (componentModule, data) => {
    const React = require('react')
    const ReactDOM = require('react-dom/server')

    const elem = React.createElement(componentModule.default, data)
    return ReactDOM.renderToString(elem)
  },
  renderClient: (container, componentModule, data, path) => {
    const React = require('react')
    const ReactDOM = require('react-dom')
    const elem = React.createElement(componentModule.default, data)
    return ReactDOM.hydrate(
      elem,
      container
    )
  },
})

export default ucsConfig
