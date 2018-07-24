import {expect} from 'chai'

import LocalizeContext from './index'
const testEnLocale = require('./test-locale.json')

describe('LocalizeContext', () => {
  describe('Number Formatting', () => {
    let enContext: LocalizeContext

    before(() => {
      enContext = new LocalizeContext('en', {en: testEnLocale})
    })

    it("standard number formatting", () => {
      const formatted = enContext.formatNumber(103021982309821)
      expect(formatted).to.equal('103,021,982,309,821')
    })
    
    it("storage formatting", () => {
      const f = enContext.formatStorageSize
      expect(f(10302198321)).to.equal('9.6Gb')
      expect(f(1030219, 'full-reduce')).to.equal('1,006.1 kilobytes')
      expect(f(10302)).to.equal('10.1kb')
      expect(f(12)).to.equal('12b')
    })

    it("currency formatting", () => {
      const f = enContext.formatCurrency
      expect(f(103021982, "AUD", "abbr-thousands")).to.equal('A$103,021.98K')
      expect(f(103021302, "AUD", "abbr-auto")).to.equal('A$103.02M')
      expect(f(108221302, "AUD", "abbr-thousands")).to.equal('A$108,221.30K')
      expect(f(1302, "AUD", "abbr-thousands")).to.equal('A$1.30K')
    })

    it("percentage formatting", () => {
      const f = enContext.formatPercentage
      expect(f(0.20)).to.equal('20%')
    })
  })
})


// <p>${formatPercentage(0.20)}</p>
