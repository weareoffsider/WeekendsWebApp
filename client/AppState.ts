import {RoutingStateShape, RoutingActionsShape} from "./platform/Routing/state"
import {
  CounterStateShape, CounterActionsShape
} from "./platform/State"



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
