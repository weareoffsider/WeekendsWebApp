

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


export function applyJavascriptFilter(
  def: FilterDefinition,
  obj: any
): boolean {
  let matched = false

  if (def.lookup == "equals") {
    matched = obj[def.key] == def.value
  } else if (
    def.lookup == "gt" ||
    def.lookup == "gte" ||
    def.lookup == "lt" ||
    def.lookup == "lte"
  ) {
    const objValue = obj[def.key]
    if (typeof def.value == "string") {
      const comparison = objValue.localeCompare(def.value)

      if (comparison > 0 && (def.lookup == "gt" || def.lookup == "gte")) {
        matched = true
      } else if (comparison < 0 && (def.lookup == "lt" || def.lookup == "lte")) {
        matched = true
      } else if (comparison == 0 && (def.lookup == "lte" || def.lookup == "gte")) {
        matched = true
      }
    } else {
      if (def.lookup == "gt") {
        matched = objValue > def.value
      } else if (def.lookup == "lt") {
        matched = objValue < def.value
      } else if (def.lookup == "gte") {
        matched = objValue >= def.value
      } else if (def.lookup == "lte") {
        matched = objValue <= def.value
      }
    }
  }

  return def.exclude ? !matched : matched
}




