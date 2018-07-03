const idb = window.indexedDB


import {MigrationType, Migration, applyMigrations} from './Migrations'




function initializeDb(
  name: string,
  migrations: Migration[]
) {
  const request = idb.open(name, migrations.length)

  request.onerror = (ev: Event) => {
    console.log("success", ev)
  }
  request.onsuccess = (ev: Event) => {
    console.log("success", ev)
  }
  request.onupgradeneeded = (ev: any) => {
    const oldVersion = ev.oldVersion
    const newVersion = ev.newVersion
    const db = (ev.target.result as IDBDatabase)
    const transaction = (ev.target.transaction as IDBTransaction)
    const migrationsToApply = migrations.slice(oldVersion)

    applyMigrations(db, transaction, migrationsToApply)
  }
  console.log(request)
}


export default {
  initializeDb,
  MigrationType,
}
