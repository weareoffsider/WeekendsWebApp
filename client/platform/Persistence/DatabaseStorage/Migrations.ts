export enum MigrationType {
  AddStore = "addStore",
  AddIndex = "addIndex",
  RemoveStore = "removeStore",
  RemoveIndex = "removeIndex",
}

export interface MigrationOption {
  storeName: string
  fieldName?: string
  storeOpts?: any
  indexOpts?: any
}

export interface MigrationAction extends MigrationOption {
  type: MigrationType
}

export interface Migration {
  actions: MigrationAction[]
}


export function applyMigrations (
  db: IDBDatabase, 
  tx: IDBTransaction,
  migrations: Migration[]
) {
  migrations.forEach((m) => {
    m.actions.forEach((ma) => {
      console.log(ma)
      switch (ma.type) {
        case MigrationType.AddStore:
          db.createObjectStore(ma.storeName, ma.storeOpts)
          break;
        case MigrationType.AddIndex:
          const store = tx.objectStore(ma.storeName)
          const index = store.createIndex(ma.fieldName, ma.fieldName, ma.indexOpts)
          break;
        case MigrationType.RemoveIndex:
          break;
        case MigrationType.RemoveStore:
          db.deleteObjectStore(ma.storeName)
          break;
      }
    })
  })


}
