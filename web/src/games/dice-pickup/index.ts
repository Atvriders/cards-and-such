import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DicePickupState, DicePickupAction, DicePickupSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DicePickupGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const dicePickupPlugin: GamePlugin<DicePickupState, DicePickupAction, typeof settings> = {
  id:"dice-pickup", title:"Dice Pickup", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Pick out dice that match the target face from a roll of 8. 10 rounds.",
  howToPlay:`Dice Pickup is a perception game played across 10 rounds. Each round, the game rolls 8 six-sided dice and picks a target face (1 through 6) at random. Your task: tap every die showing the target face, then press Submit. Each correct pick scores +5 points, but each wrong pick (a die you tapped that didn't match) costs -2 points. The round score floors at zero — you can't go negative.

After Submit, your round score is locked and the next round shuffles in. The challenge is speed and care: rapid scanning under pressure to spot every match while avoiding lookalikes — the dots on a 5 and a 6 look surprisingly similar at a glance.

Maximum theoretical score is around 200 (if every roll happened to feature 8 of the target face — astronomically unlikely). Realistic scores cluster around 50-80 points; an attentive run can crack 100. Quick, satisfying, and a real test of focus.

Tap, Submit, repeat. Easy rules; tricky to perfect!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DicePickupSettings),
  reducer,isTerminal,component:DicePickupGame,
};
