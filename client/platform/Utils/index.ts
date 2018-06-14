export function find(array: any[], testFunc: (item: any, ix: number) => boolean): any {
  for (let ix = 0; ix < array.length; ix++) {
    const item = array[ix]

    if (testFunc(item, ix)) {
      return item
    }
  }
  return null
}
