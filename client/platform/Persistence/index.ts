import PersistentKeyValueStorage from './PersistentKeyValueStorage'
import SessionKeyValueStorage from './SessionKeyValueStorage'
import DatabaseStorage, {DB} from './DatabaseStorage'

export const KeyValueStorage = PersistentKeyValueStorage
export {
  SessionKeyValueStorage,
  DatabaseStorage,
  DB,
}
