import {expect} from 'chai'

import skvs from './SessionKeyValueStorage'

describe('SessionKeyValueStorage', () => {
  describe('set and retrieve primitive values', () => {
    it('strings', () => {
      skvs.set('test1', 'test1string')
      expect(skvs.get('test1')).to.deep.eq('test1string')
    })

    it('numbers', () => {
      skvs.set('test2', 1231)
      expect(skvs.get('test2')).to.deep.eq(1231)
    })

    it('boolean', () => {
      skvs.set('test3', true)
      expect(skvs.get('test3')).to.deep.eq(true)
    })
  })

  describe('set and retrieve object values', () => {
    it('array', () => {
      const testArray = [1,2,3,4,5]
      skvs.set('test4', testArray)
      expect(skvs.get('test4')).to.deep.eq(testArray)
    })
    
    it('object', () => {
      const testObject = {
        str: "string",
        num: 2093812,
        array: [230919,239187,32987,23]
      }
      skvs.set('test5', testObject)
      expect(skvs.get('test5')).to.deep.eq(testObject)
    })
  })

  describe('clearance of store', () => {
    it('remove values', () => {
      expect(skvs.get('test5')).to.exist
      skvs.remove('test5')
      expect(skvs.get('test5')).to.equal(null)
    })

    it('clear values', () => {
      expect(skvs.get('test1')).to.exist
      expect(skvs.get('test2')).to.exist
      expect(skvs.get('test3')).to.exist
      expect(skvs.get('test4')).to.exist
      skvs.clear()
      expect(skvs.get('test1')).to.equal(null)
      expect(skvs.get('test2')).to.equal(null)
      expect(skvs.get('test3')).to.equal(null)
      expect(skvs.get('test4')).to.equal(null)
    })
  })
})










