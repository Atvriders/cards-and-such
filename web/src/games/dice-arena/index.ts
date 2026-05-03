import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceArenaState, DiceArenaAction, DiceArenaSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const DiceArenaGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.DiceArenaGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceArenaPlugin: GamePlugin<DiceArenaState, DiceArenaAction, typeof settings> = {
  id:"dice-arena", title:"Dice Arena", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Gladiator dice arena — single highest die wins glory, 10 rounds.",
  howToPlay:"Dice Arena is a 10-round gladiatorial combat mini. Each round you roll five dice, but in the arena only your single strongest fighter (highest die value) determines the round's score — though the crowd does reward variety with a small ovation.\n\nYour round score equals 8 points for each pip on your highest die, plus 1 point per unique die value in the roll. So if your max die is 6 with 4 unique values: 6*8 + 4 = 52 points. Max possible is 6*8 + 5 = 53. Min is 1*8 + 1 = 9 (all ones).\n\nThe probability of rolling at least one 6 in five dice is ~60%, so you'll often hit max-pip glory. Press Roll 5 Dice to send your gladiators in, then Next for the next bout. After 10 rounds the arena closes. Typical runs land near 380-450 points. Champion rolls push past 500.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceArenaSettings),
  reducer,isTerminal,
  hint: (state: any) => { if ((state as any).phase === "gameover" || (state as any).gameOver) return null; return { selector: '[data-testid="hint-target-dice-arena-roll"]', pulses: 3 }; },
  component:DiceArenaGame,
};
