const idb = window.indexedDB


import {MigrationType, Migration, applyMigrations} from './Migrations'
import {DBSchema, FieldType, RelationshipType} from './Schema'
import DB from './DB'


function deleteDb(name: string) {
  return new Promise((resolve, reject) => {
    const request = idb.deleteDatabase(name)
    
    request.onerror = (ev: Event) => {
      console.log("ERROR DELETING DATABASE", ev)
      reject(ev)
    }
    request.onsuccess = (ev: any) => {
      console.log("DATABASE DELETION SUCCESSFUL", ev)
      resolve(true)
    }
  })
}

function initializeDb(
  schema: DBSchema
) {
  const databaseReady = new Promise<IDBDatabase>((resolve, reject) => {
    const request = idb.open(schema.name, schema.migrations.length)

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
      const migrationsToApply = schema.migrations.slice(oldVersion)

      applyMigrations(db, transaction, migrationsToApply)
    }
  })

  return new DB(databaseReady, schema)
}


export default {
  initializeDb,
  deleteDb,
  MigrationType,
  FieldType,
  RelationshipType,
}

export {
  DB,
}
