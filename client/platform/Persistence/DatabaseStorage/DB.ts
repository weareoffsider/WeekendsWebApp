const READ_WRITE = "readwrite"

import {DataNotFoundError} from '../../Routing'

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

  closeConnection () {
    return this.dbPromise.then((db) => {
      db.close()
      return true
    })
  }
}
