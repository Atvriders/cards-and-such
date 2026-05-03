import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PhanState, PhanAction, PhanSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const PhanGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.PhanGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const phanPlugin: GamePlugin<PhanState, PhanAction, typeof settings> = {
  id:"phan-quiz", title:"Phan Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of Phan, the Vietnamese gambling card game.",
  howToPlay:"Phan is a Vietnamese gambling card game in which a banker deals out hands and players bet against the banker on whose combination is best. The game uses a Vietnamese deck and rewards combinations such as pairs, runs, and matched suits. Phan is part of the wider Southeast Asian fan-tan family — relatives include Phan-Tan and various banker-style table games — and is most often played casually during Tet, the Vietnamese Lunar New Year.\n\nThis is a 10-question multiple-choice quiz. Each question gives you 15 seconds to answer. Tap one of the four choices, then press Submit to lock in your answer.\n\nYou earn 100 base points for every correct answer plus 10 points for each second remaining on the clock — quick correct answers are worth far more than slow ones. Wrong answers earn nothing.\n\nAfter you submit, the correct answer is revealed: green for correct, red for wrong. Press Next to continue. The game ends after all 10 questions.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as PhanSettings),
  reducer,isTerminal,
  hint: (state: PhanState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:PhanGame,
};
