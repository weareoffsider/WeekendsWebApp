import {RoutingStateShape, RoutingActionsShape} from "./platform/Routing/state"
import DB from './platform/Persistence/DatabaseStorage/DB'
import LocalizeContext from './platform/Localize'


export interface SeaTimeState extends
RoutingStateShape
{
}

export interface SeaTimeActions extends
RoutingActionsShape
{
}

export interface SeaTimeContext {
  // db: DB
  localize: LocalizeContext,
  actions: SeaTimeActions
  getUrl: (routeName: string, params?: any) => string
}
