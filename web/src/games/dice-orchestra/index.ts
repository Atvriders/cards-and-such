import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceOrchestraState, DiceOrchestraAction, DiceOrchestraSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const DiceOrchestraGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.DiceOrchestraGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceOrchestraPlugin: GamePlugin<DiceOrchestraState, DiceOrchestraAction, typeof settings> = {
  id:"dice-orchestra", title:"Dice Orchestra", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Strings, brass, percussion — pick a section and roll for harmony.",
  howToPlay:"Dice Orchestra is a tiny musical performance. Each round, you choose a section of the orchestra: Strings (sum 4-7), Brass (sum 8-10), or Percussion (extremes — sum 2-3 or 11-12). The dice are rolled and the conductor sees if your section \"leads\" the piece.\n\nScoring: Strings (~50%) pays 12, Brass (~38%) pays 18, Percussion (~11%) pays 60 — the percussion crash is rare but huge. Wrong calls score nothing.\n\nTen rounds total. Mostly safe Strings will get you a solid score; gambling on Percussion every round risks zero, but a few crashes can crown you maestro of the dice. Pick your section and let the symphony roll!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceOrchestraSettings),
  reducer,isTerminal,
  hint: (state: any) => { if ((state as any).phase === "gameover" || (state as any).gameOver) return null; return { selector: '[data-testid="hint-target-dice-orchestra-roll"]', pulses: 3 }; },
  component:DiceOrchestraGame,
};
