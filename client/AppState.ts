import {RoutingStateShape, RoutingActionsShape} from "./platform/Routing/state"
import {
  CounterStateShape, CounterActionsShape
} from "./platform/State"

import {ContentStateShape, ContentActionsShape} from './test-data/state'


import DB from './platform/Persistence/DatabaseStorage/DB'


export interface WeekendsWebAppState extends
RoutingStateShape,
CounterStateShape,
ContentStateShape
{
}

export interface WeekendsWebAppActions extends
RoutingActionsShape,
CounterActionsShape,
ContentActionsShape
{
}

export interface WeekendsWebAppContext {
  db: DB
  actions: WeekendsWebAppActions
}
