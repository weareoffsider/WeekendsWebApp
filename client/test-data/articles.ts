export interface Article {
  id: string
  author_id: string
  title: string
  content: string
}

const lipsum = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam hendrerit suscipit dui vitae aliquet. Nullam suscipit varius erat eu sagittis. Ut efficitur bibendum nibh, in faucibus urna interdum ut. Duis faucibus tellus id suscipit vulputate. Nunc nunc magna, egestas id gravida eget, scelerisque quis odio. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Curabitur vitae massa eu dui bibendum aliquam."

export default [
  {id: "entry-one", author_id: "0", title: "1. ENTRY ONE", content: lipsum},
  {id: "entry-two", author_id: "1", title: "2. ENTRY TWO", content: lipsum},
  {id: "entry-three", author_id: "2", title: "3. ENTRY THREE", content: lipsum},
  {id: "entry-four", author_id: "0", title: "4. ENTRY FOUR", content: lipsum},
]
