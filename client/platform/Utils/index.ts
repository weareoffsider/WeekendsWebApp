export function find<T>(array: T[], testFunc: (item: T, ix: number) => boolean): T | null {
  for (let ix = 0; ix < array.length; ix++) {
    const item = array[ix]

    if (testFunc(item, ix)) {
      return item
    }
  }

  return null
}
