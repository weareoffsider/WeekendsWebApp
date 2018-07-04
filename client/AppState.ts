import {RoutingStateShape, RoutingActionsShape} from "./platform/Routing/state"
import {
  CounterStateShape, CounterActionsShape
} from "./platform/State"


import DB from './platform/Persistence/DatabaseStorage/DB'


export interface WeekendsWebAppState extends
RoutingStateShape,
CounterStateShape
{
}

export interface WeekendsWebAppActions extends
RoutingActionsShape,
CounterActionsShape
{
}

export interface WeekendsWebAppContext {
  db: DB
}
