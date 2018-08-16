import {
  UniversalComponentConfig,
} from 'universal-component-server'

const context = (require as any).context('../ui', true)
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

export default ucsConfig
