import {INCREMENT_ACTION, DECREMENT_ACTION, NOTHING_ACTION, reducer} from './index'

test('increment action changes state to 1', () => {
  const state = {count: 0}
  const stateStep1 = reducer(state, INCREMENT_ACTION) // 1
  const stateStep2 = reducer(stateStep1, INCREMENT_ACTION) // 2
  const stateStep3 = reducer(stateStep2, DECREMENT_ACTION) // 2 - 1
  const stateStep4 = reducer(stateStep3, NOTHING_ACTION) // 1

  console.log([state, stateStep1, stateStep2, stateStep3, stateStep4])
  console.log(stateStep3 == stateStep4)
  expect(stateStep1.count).toEqual(1)
  expect(stateStep2.count).toEqual(2)
  expect(stateStep3.count).toEqual(1)
  expect(stateStep4.count).toEqual(1)
  expect(stateStep4).toBe(stateStep3)

})
