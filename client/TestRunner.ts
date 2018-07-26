const mochaBrowser: any = require('mocha/mocha.js')


mocha.setup('bdd')
const testsContext = (require as any).context('.', true, /\.(browser)?test\.ts$/)
testsContext.keys().forEach((key: string) => {
  testsContext(key)
})
// mocha.checkLeaks()
mocha.run()
