import PersistentKeyValueStorage from './PersistentKeyValueStorage'
import SessionKeyValueStorage from './SessionKeyValueStorage'
import DatabaseStorage from './DatabaseStorage'

export const KeyValueStorage = PersistentKeyValueStorage
export {
  SessionKeyValueStorage,
  DatabaseStorage,
}
