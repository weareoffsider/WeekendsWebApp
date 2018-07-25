import {expect} from 'chai'

import pkvs from './PersistentKeyValueStorage'

describe('PersistentKeyValueStorage', () => {
  describe('set and retrieve primitive values', () => {
    it('strings', () => {
      pkvs.set('test1', 'test1string')
      expect(pkvs.get('test1')).to.deep.eq('test1string')
    })

    it('numbers', () => {
      pkvs.set('test2', 1231)
      expect(pkvs.get('test2')).to.deep.eq(1231)
    })

    it('boolean', () => {
      pkvs.set('test3', true)
      expect(pkvs.get('test3')).to.deep.eq(true)
    })
  })

  describe('set and retrieve object values', () => {
    it('array', () => {
      const testArray = [1,2,3,4,5]
      pkvs.set('test4', testArray)
      expect(pkvs.get('test4')).to.deep.eq(testArray)
    })
    
    it('object', () => {
      const testObject = {
        str: "string",
        num: 2093812,
        array: [230919,239187,32987,23]
      }
      pkvs.set('test5', testObject)
      expect(pkvs.get('test5')).to.deep.eq(testObject)
    })
  })

  describe('clearance of store', () => {
    it('remove values', () => {
      expect(pkvs.get('test5')).to.exist
      pkvs.remove('test5')
      expect(pkvs.get('test5')).to.equal(null)
    })

    it('clear values', () => {
      expect(pkvs.get('test1')).to.exist
      expect(pkvs.get('test2')).to.exist
      expect(pkvs.get('test3')).to.exist
      expect(pkvs.get('test4')).to.exist
      pkvs.clear()
      expect(pkvs.get('test1')).to.equal(null)
      expect(pkvs.get('test2')).to.equal(null)
      expect(pkvs.get('test3')).to.equal(null)
      expect(pkvs.get('test4')).to.equal(null)
    })
  })
})










