import {expect} from 'chai'

import DatabaseStorage, {DB} from './index'
import schema from './TestingData/schema'
import allAuthors from './TestingData/authors'
import allArticles from './TestingData/articles'
import {DataNotFoundError} from '../../Routing'
import {
  applyJavascriptFilter,
  createKeyRangeForFilter,
} from './Query'

const {AddStore, AddIndex} = DatabaseStorage.MigrationType
const {FieldType, RelationshipType} = DatabaseStorage

describe('DatabaseStorage', () => {
  describe('Initialization', () => {
    it('can init database', () => {
      const db = DatabaseStorage.initializeDb(schema)
      return db.closeConnection()
    })

    it('can remove database', () => {
      return DatabaseStorage.deleteDb(schema.name)
        .then(() => {
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
      return DatabaseStorage.deleteDb(schema.name)
    })
  })

  describe('Migrations', () => {
    const migrationTestSchema = {
      name: "MigrationTestDatabase",
      migrations: [{
        actions: [
          {type: AddStore, storeName: "authors", storeOpts: {keyPath: "id"}},
          {type: AddStore, storeName: "articles", storeOpts: {keyPath: "id"}},
          {type: AddIndex, storeName: "articles", fieldName: "author_id"},
          {type: AddIndex, storeName: "articles", fieldName: "publication_date"},
          {type: AddIndex, storeName: "articles", fieldName: "title"},
        ],
      }],
      stores: {},
    }

    it('add stores and indexes successfully', () => {
      return DatabaseStorage.initializeDb(migrationTestSchema).closeConnection()
        .then(() => {
          return new Promise((resolve, reject) => {
            const request = window.indexedDB.open(
              migrationTestSchema.name, migrationTestSchema.migrations.length
            )
            request.onsuccess = (ev: any) => {
              console.log(ev.target.result)
              const db: IDBDatabase = ev.target.result
              try {
                const tx = db.transaction(['authors', 'articles'])
                const authorStore = tx.objectStore('authors')
                const articlesStore = tx.objectStore('articles')

                expect(authorStore.keyPath).to.equal('id')
                expect(articlesStore.keyPath).to.equal('id')
                articlesStore.index('author_id')
                articlesStore.index('publication_date')
                articlesStore.index('title')
              } catch (e) {
                ev.target.result.close()
                reject(e)
              }
              
              resolve(true)
              ev.target.result.close()
            }
          })
        })
    })

    after(function() {
      return DatabaseStorage.deleteDb(migrationTestSchema.name)
    })
  })

  describe('Data Saving/Retrieval', () => {
    let db: DB
    before(() => {
      db = DatabaseStorage.initializeDb(schema)
    })

    it('can save items successfully', () => {
      return Promise.all(
        allAuthors.map((a) => {
          return db.save("authors", a)
        }).concat(
          allArticles.map((a) => {
            return db.save("articles", a)
          })
        )
      )
    })

    it('can retrieve single items successfully', () => {
      const testAuthor = allAuthors[0]
      const testArticle = allArticles[0]
      return Promise.all([
        db.getByKey('authors', testAuthor.id).then((author: any) => {
          expect(author).to.deep.equal(testAuthor)
        }),
        db.getByKey('articles', testArticle.id).then((article: any) => {
          expect(article).to.deep.equal(testArticle)
        }),
      ])
    })

    it('throws DataNotFoundError on key not found', () => {
      return db.getByKey('authors', '123').then((author: any) => {
        throw new Error(
          `expected not to find anything, however found ${author.full_name}`
        )
      }, (err: any) => {
        expect(err.name).to.equal("DataNotFoundError")
      })
    })


    it('can retrieve a query successfully', () => {
      const query = {
        store: 'articles',
        filters: [
          { key: 'author_id', lookup: 'equals', value: '0', },
        ]
      }
      return db.query(query).then((articles: any) => {
        articles.forEach((article: any) => {
          expect(article.author_id).to.equal('0')
        })
      })
    })

    after(() => {
      return db.closeConnection()
        .then(() => {
          return DatabaseStorage.deleteDb(schema.name)
        })
    })
  })

  const equalsFilterDef = {key: "name", lookup: "equals", value: "Joe"}
  const gtFilterDef = {key: "name", lookup: "gt", value: "Joe"}
  const ltFilterDef = {key: "name", lookup: "lt", value: "Joe"}
  const gteFilterDef = {key: "name", lookup: "gte", value: "Joe"}
  const lteFilterDef = {key: "name", lookup: "lte", value: "Joe"}

  describe('Key Range Filters', () => {
    it('creates "Only" key ranges for equals filter', () => {
      const keyRange = createKeyRangeForFilter(equalsFilterDef)
      expect(keyRange.lower).to.equal(equalsFilterDef.value)
      expect(keyRange.upper).to.equal(equalsFilterDef.value)
    })

    it('creates "Lower Bound Open" key ranges for greater than filter', () => {
      const keyRange = createKeyRangeForFilter(gtFilterDef)
      expect(keyRange.lower).to.equal(gtFilterDef.value)
      expect(keyRange.lowerOpen).to.equal(true)
      expect(keyRange.upper).to.equal(undefined)
    })

    it('creates "Lower Bound Closed" key ranges for greater than or equal filter', () => {
      const keyRange = createKeyRangeForFilter(gteFilterDef)
      expect(keyRange.lower).to.equal(gteFilterDef.value)
      expect(keyRange.lowerOpen).to.equal(false)
      expect(keyRange.upper).to.equal(undefined)
    })

    it('creates "Upper Bound Open" key ranges for less than filter', () => {
      const keyRange = createKeyRangeForFilter(ltFilterDef)
      expect(keyRange.upper).to.equal(ltFilterDef.value)
      expect(keyRange.upperOpen).to.equal(true)
      expect(keyRange.lower).to.equal(undefined)
    })

    it('creates "Upper Bound Closed" key ranges for less than or equal filter', () => {
      const keyRange = createKeyRangeForFilter(lteFilterDef)
      expect(keyRange.upper).to.equal(lteFilterDef.value)
      expect(keyRange.upperOpen).to.equal(false)
      expect(keyRange.lower).to.equal(undefined)
    })
  })
})
