import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { NimGameState, NimGameAction, NimGameSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { NimGameGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const nimGamePlugin: GamePlugin<NimGameState, NimGameAction, typeof settings> = {
  id:"nim-game", title:"Nim Game", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"21-stick Nim against a random CPU. Don't take the last stick.",
  howToPlay:`Nim Game is the classic last-stick-loses subtraction puzzle. The pile starts with 21 matchsticks; you and the CPU take turns removing 1, 2, or 3 sticks each round. Whoever is forced to take the final stick loses.

You play first. Tap "Take 1," "Take 2," or "Take 3" to grab sticks; the CPU then takes its random 1-3 in response. Play continues until the pile reaches zero. A win scores 100 points; a loss scores 0.

The mathematical optimal: leave a multiple of 4 (4, 8, 12, 16, 20) for the CPU after your move, and you're guaranteed to win. Since the CPU plays randomly though, even slightly suboptimal play can still grind out a win on most runs.

If the CPU happens to land you in a losing position by luck, you'll have to gamble on the next turn. A wise opening: take 1 to leave 20 — a winning position regardless of what the CPU does next. Outsmart the random opponent and claim the 100-point prize!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as NimGameSettings),
  reducer,isTerminal,component:NimGameGame,
};
