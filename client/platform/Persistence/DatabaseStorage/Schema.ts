import {Migration} from './Migrations'

export interface DBSchema {
  name: string
  migrations: Migration[]
  stores: {
    [key: string]: StoreSchema
  }
}

export interface StoreSchema {
  name: string
  fields: {[key: string]: FieldSchema}
  relationships: {[key: string]: RelationshipSchema}
}

export interface FieldSchema {
  indexed?: boolean
  multiPath?: boolean
  type: FieldType
}

export enum FieldType {
  String = "string",
  Number = "number",
  Date = "date",
  DateTime = "datetime",
  Object = "object", // typically not indexed
  Array = "array", // typically not index
}

export interface RelationshipSchema {
  type: RelationshipType
  thisKey: string
  storeName: string
  storeKey: string
}

export enum RelationshipType {
  BelongsTo = "belongs_to",
  HasMany = "has_many",
  HasOne = "has_one",
  ManyToMany = "many_to_many",
}
