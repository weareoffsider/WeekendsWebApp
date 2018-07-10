const READ_WRITE = "readwrite"

import {DataNotFoundError} from '../../Routing'
import {
  QueryDefinition,
  createKeyRangeForFilter,
} from './Query'

export default class DB {

  constructor (
    private dbPromise: Promise<IDBDatabase>
  ) {
    this.dbPromise = dbPromise
  }

  save (storeName: string, obj: any) {
    return this.dbPromise.then((db) => {
      return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, READ_WRITE)
        const store = tx.objectStore(storeName)
        const storeRequest = store.add(obj)
        storeRequest.onerror = function (ev: any) {
          console.log("SAVE ERROR", ev)
        }
        tx.oncomplete = function (ev: any) {
          resolve(ev)
        }
        tx.onerror = function (ev: any) {
          reject(ev)
        }
      })
    })
  }

  getByKey (storeName: string, key: string) {
    return this.dbPromise.then((db) => {
      return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName)
        const store = tx.objectStore(storeName)
        const storeRequest = store.get(key)
        console.log("getByKey", storeName, key)
        storeRequest.onsuccess = function (ev: any) {
          console.log("SUCCESS", ev, storeRequest.result)
          if (storeRequest.result != undefined) {
            resolve(storeRequest.result)
          } else {
            reject(new DataNotFoundError(`${key} in ${storeName} could not be found`))
          }
        }
        storeRequest.onerror = function (ev: any) {
          console.log("ERROR", ev)
          reject(new Error("database had an error"))
        }
      })
    })
  }

  query (queryDefinition: QueryDefinition) {
    return this.dbPromise.then((db) => {
      return new Promise((resolve, reject) => {
        const storeName = queryDefinition.store
        const tx = db.transaction(storeName)
        const store: any = tx.objectStore(storeName)
        const initialFilter = queryDefinition.filters.length > 0
          ? queryDefinition.filters[0]
          : null

        const keyRange = createKeyRangeForFilter(initialFilter)
        let storeRequest
        if (!keyRange) {
          storeRequest = store.openCursor()
        } else {
          const index = store.index(initialFilter.key)
          storeRequest = index.openCursor(keyRange)
        }

        const results: any[] = []
        storeRequest.onsuccess = function (ev: any) {
          if (ev.target.result) {
            const cursor = (ev.target.result as IDBCursorWithValue)
            // TODO: filtering logic done with JS
            results.push(cursor.value)
            cursor.continue()
          } else {
            console.log("QUERY END", queryDefinition, results)
            resolve(results)
          }
        }
        storeRequest.onerror = function (ev: any) {
          console.log("ERROR", ev)
          reject(new Error("database had an error"))
        }
      })
    })
  }

  getAll (storeName: string) {
    return this.dbPromise.then((db) => {
      return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName)
        const store: any = tx.objectStore(storeName)
        const storeRequest = store.getAll()
        storeRequest.onsuccess = function (ev: any) {
          console.log("SUCCESS", ev, storeRequest.result)
          if (storeRequest.result != undefined) {
            resolve(storeRequest.result)
          } else {
            resolve([])
          }
        }
        storeRequest.onerror = function (ev: any) {
          console.log("ERROR", ev)
          reject(new Error("database had an error"))
        }
      })
    })
  }

  closeConnection () {
    return this.dbPromise.then((db) => {
      db.close()
      return true
    })
  }
}
