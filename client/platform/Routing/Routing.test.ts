import {expect} from 'chai'

import {DatabaseStorage} from '../Persistence'

describe('RouteMatcher', () => {
  it('match path to route works on parameter free routes', () => {
    const matcher = "/about/"
    const path = "/about/"
    
    const viewParams = false
    expect(viewParams).to.exist;
  })

  it('match path to route returns null when no match', () => {
    const matcher = "/ab/"
    const path = "/about/"

    const viewParams = false
    expect(viewParams).to.equal(null)
  })

  it('match path to route returns correct parameters', () => {
    const matcher = "/entry/:slug/"
    const path = "/entry/one-two-three/"

    const viewParams = false
    expect(viewParams).to.equal({slug: "one-two-three"})
  })
})
