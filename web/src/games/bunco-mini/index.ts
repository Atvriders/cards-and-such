import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BuncoMiniState, BuncoMiniAction, BuncoMiniSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BuncoMiniGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const buncoMiniPlugin: GamePlugin<BuncoMiniState, BuncoMiniAction, typeof settings> = {
  id:"bunco-mini", title:"Bunco Mini", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Six rounds of three dice with a target rolling each round. Triples on target = BUNCO!",
  howToPlay:`Bunco Mini is a quick six-round dice game inspired by the classic party game Bunco. In each round N (1 through 6), you roll three six-sided dice and score based on how many show the round's target number:

- One die showing N: +1 point.
- Two dice showing N: +2 points.
- Three dice showing N: BUNCO! +21 points (Bunco's signature jackpot).
- Three dice all the same but NOT showing N: +5 points (mini-bonus).

The target rolls up each round: round 1 targets 1s, round 2 targets 2s, all the way to round 6 targeting 6s. So in round 4, you want fours; sixes don't count.

Probability of a Bunco on any single round is 1 in 216 (~0.46%), so a real Bunco is a celebration. Most rounds yield 0-2 points. A typical game scores around 8-12 points; rolling a Bunco can shoot you to 30+.

Roll, count, cheer for the rare BUNCO!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as BuncoMiniSettings),
  reducer,isTerminal,hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-bunco-mini-primary"]', pulses: 3 }), component:BuncoMiniGame,
};
