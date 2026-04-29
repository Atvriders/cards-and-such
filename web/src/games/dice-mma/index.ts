import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceMmaState, DiceMmaAction, DiceMmaSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceMmaGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceMmaPlugin: GamePlugin<DiceMmaState, DiceMmaAction, typeof settings> = {
  id:"dice-mma", title:"MMA Card Fighter Dice", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"MMA mixed-martial-arts dice: 12 rounds, 2 dice per round.",
  howToPlay:"MMA Card Fighter Dice distills the mixed-martial-arts card-game simulator into a quick 12-round dice fight. Each round you roll two dice; the sum (2-12) represents your strikes-and-grappling damage on the opponent — high rolls are clean takedowns and ground-and-pound, low rolls are caught in submissions or eat counter-punches. Add up totals across all 12 rounds for your final score. MMA card games have been published by various designers — they aim to simulate the standup, takedown, ground game, and submission interplay of UFC and Bellator fights. Each fighter has stats for striking, wrestling, BJJ, cardio, and chin. Real MMA card games are deeply granular; this digital mini abstracts a fight into 2d6 sums per round. Expected per-round average 7, total 84 across 12 rounds. Hot streaks push 110; cold slip to 60. Press Roll, Next. Quick fix.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceMmaSettings),
  reducer,isTerminal,component:DiceMmaGame,
};
