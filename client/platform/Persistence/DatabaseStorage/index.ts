const idb = window.indexedDB


import {MigrationType, Migration, applyMigrations} from './Migrations'
import DB from './DB'




function initializeDb(
  name: string,
  migrations: Migration[]
) {
  const databaseReady = new Promise<IDBDatabase>((resolve, reject) => {
    const request = idb.open(name, migrations.length)

    request.onerror = (ev: Event) => {
      console.log("DATABASE ERROR", ev)
      reject(ev)
    }
    request.onsuccess = (ev: any) => {
      console.log("DATABASE READY", ev)

      const db = (ev.target.result as IDBDatabase)
      resolve(db)
    }

    request.onupgradeneeded = (ev: any) => {
      console.log("DATABASE UPGRADING", ev)
      const oldVersion = ev.oldVersion
      const newVersion = ev.newVersion
      const db = (ev.target.result as IDBDatabase)
      const transaction = (ev.target.transaction as IDBTransaction)
      const migrationsToApply = migrations.slice(oldVersion)

      applyMigrations(db, transaction, migrationsToApply)
    }
  })

  return new DB(databaseReady)
}


export default {
  initializeDb,
  MigrationType,
}
