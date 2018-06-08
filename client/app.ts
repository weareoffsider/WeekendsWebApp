console.log("Hello World One")
import dependencyFunc from './dependency'

interface Thing {
  foo: string
  bar: number
}

let counter = 0

function tickOne() {
  const timeElement = document.querySelector('time')
  counter++
  timeElement.textContent = counter.toString()
  dependencyFunc("number " + counter)

  window.setTimeout(tickOne, 1000)
}

window.setTimeout(tickOne, 1000)
