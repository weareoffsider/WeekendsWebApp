import {matchPathToRoute} from './index'

test('match path to route works on parameter free routes', () => {
  const matcher = "/about/"
  const path = "/about/"
  
  const viewParams = matchPathToRoute(path, matcher)
  expect(viewParams).toBeTruthy()
})

test('match path to route returns null when no match', () => {
  const matcher = "/ab/"
  const path = "/about/"

  const viewParams = matchPathToRoute(path, matcher)
  expect(viewParams).toBeNull()
})

test('match path to route returns correct parameters', () => {
  const matcher = "/entry/:slug/"
  const path = "/entry/one-two-three/"

  const viewParams = matchPathToRoute(path, matcher)
  expect(viewParams).toEqual({slug: "one-two-three"})
})
