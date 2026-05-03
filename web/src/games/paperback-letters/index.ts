import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PaperbackLettersState, PaperbackLettersAction, PaperbackLettersSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const PaperbackLettersGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.PaperbackLettersGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const paperbackLettersPlugin: GamePlugin<PaperbackLettersState, PaperbackLettersAction, typeof settings> = {
  id:"paperback-letters",
  title:"Paperback Letters",
  category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Spell pseudo-words with random letter cards.",
  howToPlay:"Paperback Letters is a fantasy-themed letter-card game inspired by the deckbuilder of the same name. Each round, five letter cards are drawn from a deck weighted toward common consonants (each worth 1) with rare bonus letters Q, X, Z worth 5. 📚\n\nYour round score is the sum of letter values, plus a bonus of 3 for each pair of matching letters in your hand. Across 10 rounds, expect around 60 to 100 points total. Hitting a Q or Z is a celebration; a duplicate pair is a small thrill.\n\nPress Draw to reveal your five letter tiles, then Next to advance. There's no spelling required — the game just rolls letters and rewards luck. Aim for 90+ to be a literary champion. Simple, fast, and oddly satisfying as the alphabet tumbles out across ten short rounds. A miniature ode to wordsmiths everywhere.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as PaperbackLettersSettings),
  reducer,
  isTerminal,hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-paperback-letters-primary"]', pulses: 3 }),
  component:PaperbackLettersGame,
};
