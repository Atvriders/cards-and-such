import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PylosAbsState, PylosAbsAction, PylosAbsSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const PylosAbsGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.PylosAbsGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const pylosAbsPlugin: GamePlugin<PylosAbsState, PylosAbsAction, typeof settings> = {
  id:"pylos-abs", title:"Pylos", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Trivia about Pylos, the pyramid-stacking abstract by David Parlett (Gigamic).",
  howToPlay:"Pylos Trivia is a ten-question quiz about Pylos, a David Parlett-designed abstract two-player strategy game published by Gigamic. The wooden game uses a 4×4 base for stacking spheres into a pyramid. Each turn a player places one of their spheres on an empty position. A new layer can be built on top of any 2×2 square completed below; each higher layer is one row narrower (4×4 → 3×3 → 2×2 → 1). Players may also 'climb' a sphere from a lower position to a higher (a free upgrade). The player forced to place the very last (top) sphere loses. Each question tests rules and tactics. Tap an answer and Submit; correct answers earn 100 base points plus 10 per second remaining on the 15-second timer. Wrong answers reveal the correct option. After ten questions your final score is shown.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as PylosAbsSettings),
  reducer,isTerminal,hint: (state: PylosAbsState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-pylos-abs-answer-0"]', pulses: 3 } : null, component:PylosAbsGame,
};
