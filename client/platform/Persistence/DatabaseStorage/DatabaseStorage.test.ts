import {expect} from 'chai'

import DatabaseStorage from './index'
import schema from './TestingData/schema'
import allAuthors from './TestingData/authors'
import allArticles from './TestingData/articles'

describe('DatabaseStorage', () => {
  describe('Initialization', () => {
    it('can init database', () => {
      console.log('can init database')
      const db = DatabaseStorage.initializeDb(schema)
      return db.closeConnection()
    })

    it('can remove database', () => {
      return DatabaseStorage.deleteDb('TestDatabase')
        .then(() => {
          console.log('hello')
          return new Promise((resolve, reject) => {
            const request = window.indexedDB.open('TestDatabase', 3)
            let result: string | boolean
            request.onupgradeneeded = (ev: any) => {
              if (ev.oldVersion === 0) {
                result = true
              } else {
                result = `Database with version ${ev.oldVersion} already exists`
              }
            }
            request.onsuccess = (ev: any) => {
              ev.target.result.close()
              if (result == true) {
                resolve(result)
              } else {
                reject(result)
              }
            }
          })
        })
    })
    
    after(function() {
      return DatabaseStorage.deleteDb('TestDatabase')
    })
  })
})
