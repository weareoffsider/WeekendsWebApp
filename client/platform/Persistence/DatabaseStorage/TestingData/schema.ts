import DatabaseStorage from '../index'

const {AddStore, AddIndex} = DatabaseStorage.MigrationType
const {FieldType, RelationshipType} = DatabaseStorage

const migrations = [
  // VERSION 1
  {
    actions: [
      {type: AddStore, storeName: "authors", storeOpts: {keyPath: "id"}},
      {type: AddStore, storeName: "articles", storeOpts: {keyPath: "id"}},
      {type: AddIndex, storeName: "articles", fieldName: "author_id"},
      {type: AddIndex, storeName: "articles", fieldName: "publication_date"},
      {type: AddIndex, storeName: "articles", fieldName: "title"},
    ],
  },
  // VERSION 2
  // {
  //   actions: [
  //     {type: AddStore, storeName: "categories"},
  //     {type: AddStore, storeName: "pages"},
  //     {type: AddIndex, storeName: "articles", fieldName: "category_ids", indexOpts: {multiEntry: true}}
  //   ],
  // }
]

const schema = {
  name: "TestDatabase",
  migrations,
  stores: {
    "authors": {
      name: "authors",
      fields: {
        "id": {indexed: true, type: FieldType.String},
        "full_name": {indexed: false, type: FieldType.String},
      },
      relationships: {
        "articles": {type: RelationshipType.HasMany, thisKey: "id", storeName: "articles", storeKey: "author_id"},
      }
    }, 
    "articles": {
      name: "articles",
      fields: {
        "id": {indexed: true, type: FieldType.String},
        "author_id": {indexed: true, type: FieldType.String},
        "title": {indexed: true, type: FieldType.String},
        "publication_date": {indexed: true, type: FieldType.Date},
        "content": {type: FieldType.String},
      },
      relationships: {
        "author": {type: RelationshipType.BelongsTo, thisKey: "author_id", storeName: "authors", storeKey: "id"},
      }
    },
  }
}

export default schema
