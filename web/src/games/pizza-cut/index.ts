import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PizzaCutState, PizzaCutAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PizzaCut } from "./PizzaCut.js";
export const pizzaCutSettings = { rounds:{kind:"enum" as const,label:"Rounds",options:["5","10","15"] as const,default:"10" as const} } as const;
type S=SettingsOf<typeof pizzaCutSettings>;
export const pizzaCutPlugin:GamePlugin<PizzaCutState,PizzaCutAction,typeof pizzaCutSettings> = {
  id:"pizza-cut",title:"Pizza Cut",category:"arcade",
  players:{min:1,max:1,multiplayer:false},
  description:"Tap to cut pizza slices and score points each round.",
  howToPlay:`Pizza Cut is a fun tapping arcade game. Each round a pizza arrives and needs to be cut into a target number of slices. Tap the cutter button once for each slice. Watch the cut counter and stop at the target. Finishing a pizza earns 10 points. A new pizza with a fresh slice count appears each round. Play 5, 10, or 15 rounds. Tips: Pizzas need 3 to 8 cuts depending on how many slices are ordered. Count carefully — nobody wants a pizza with the wrong number of slices! Keep a steady tapping rhythm and watch the counter to hit the target exactly every round.`,
  settings:pizzaCutSettings,
  initialState:(seed:number,settings:S)=>initialState(seed,settings),
  reducer,isTerminal,component:PizzaCut,
};
