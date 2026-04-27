import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceRelayMiniState, DiceRelayMiniAction, DiceRelayMiniSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceRelayMiniGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceRelayMiniPlugin: GamePlugin<DiceRelayMiniState, DiceRelayMiniAction, typeof settings> = {
  id:"dice-relay-mini", title:"Dice Relay Mini", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"5-stage dice relay across 5 rounds. Hit higher targets to advance.",
  howToPlay:`Dice Relay Mini is a five-stage challenge spread across 5 rounds. Each stage demands a higher dice-sum target: stage 1 needs 5+, stage 2 needs 6+, stage 3 needs 7+, stage 4 needs 8+, and stage 5 needs 9+ — a steady upward climb.

Each round you press Roll to throw two six-sided dice. Hit (or beat) the current stage's target sum and you advance to the next stage AND score 20 points. Miss, and you stay put for nothing.

You only get 5 rolls total, regardless of how many stages you've conquered. So even with all five stages cleared, your max score is 100 points (5 rounds × 20). Reaching stage 5 in the first 4 rolls and then nailing the last 9+ is the ultimate flex.

Two dice on a fair roll average 7, so early stages are safer. Late stages depend on luck. Strong runs land at 60-80 points; perfect = 100.`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceRelayMiniSettings),
  reducer,isTerminal,component:DiceRelayMiniGame,
};
