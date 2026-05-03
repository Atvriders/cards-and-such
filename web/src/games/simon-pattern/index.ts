import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SimonPatternState, SimonPatternAction, SimonPatternSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const SimonPatternGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.SimonPatternGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const simonPatternPlugin: GamePlugin<SimonPatternState, SimonPatternAction, typeof settings> = {
  id:"simon-pattern", title:"Simon Pattern", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Memory-pattern reflex inspired by classic Simon.",
  howToPlay:"Simon Pattern is a thirty-tick rhythm-and-reflex game inspired by the iconic Simon memory game. Each tick (about one second), the central panel signals either an ACTION beat or a REST beat. Your task: tap when the panel calls for action, hold still on rest beats. A correct action tap scores ten points; a wrongful rest tap deducts five points (minimum zero). The timer counts down thirty ticks in the upper-right corner. While the original Simon tested working memory through repeating tone sequences, this variant focuses on rhythm-following and impulse control with immediate feedback every tick. Average runs net 80-140 points; rhythm-locked reflex pros with disciplined inhibition score 200+ regularly. When the thirty ticks expire, your final score is locked in. Listen to the beat, tap on action, and rest on rest. Channel your inner Simon — and stay in the groove all thirty ticks!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as SimonPatternSettings),
  reducer,isTerminal,hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-simon-pattern-action"]', pulses: 3 }; }, component:SimonPatternGame,
};
