

export interface FilterDefinition {
  key: string
  lookup: string
  exclude?: boolean
  value: any
}

export interface QueryDefinition {
  store: string
  filters: FilterDefinition[]
}




export function createKeyRangeForFilter(def: FilterDefinition): IDBKeyRange | null {
  if (def.exclude) {
    return null
  }

  if (def.lookup == "equals") {
    return IDBKeyRange.only(def.value)
  } else if (def.lookup == "gt") {
    return IDBKeyRange.lowerBound(def.value, true)
  } else if (def.lookup == "gte") {
    return IDBKeyRange.lowerBound(def.value)
  } else if (def.lookup == "lt") {
    return IDBKeyRange.upperBound(def.value, true)
  } else if (def.lookup == "lte") {
    return IDBKeyRange.upperBound(def.value)
  }

  return null
}
