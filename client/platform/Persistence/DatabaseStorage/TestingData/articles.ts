export interface Article {
  id: string
  author_id: string
  title: string
  content: string
  publication_date: string
}

const lipsum = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam hendrerit suscipit dui vitae aliquet. Nullam suscipit varius erat eu sagittis. Ut efficitur bibendum nibh, in faucibus urna interdum ut. Duis faucibus tellus id suscipit vulputate. Nunc nunc magna, egestas id gravida eget, scelerisque quis odio. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Curabitur vitae massa eu dui bibendum aliquam."

const articles: Article[] = []

let year = 2018 
let month = 9

for (let ix = 0; ix < 40; ix++) {
  const author_id = Math.round(Math.random() * 2).toString()
  articles.push({
    id: "entry-" + ix,
    author_id: author_id,
    title: `${ix}. ENTRY ${ix}`,
    content: lipsum,
    publication_date: `${year}-0${month}-15`,
  })

  month--

  if (month == 0) {
    month = 9
    year--
  }
}


export default articles
