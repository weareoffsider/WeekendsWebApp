export default function (data: any) {
  return `<button class="Button Button--${data.modifier}">
    ${data.title}
  </button>`
}
