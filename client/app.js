console.log("Hello World")

var counter = 0

function tickOne() {
  var timeElement = document.querySelector('time')
  counter++
  timeElement.textContent = counter

  window.setTimeout(tickOne, 1000)
}

window.setTimeout(tickOne, 1000)
