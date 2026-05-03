import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TanukiMemoryState, TanukiMemoryAction, TanukiMemorySettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const TanukiMemoryGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.TanukiMemoryGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const tanukiMemoryPlugin: GamePlugin<TanukiMemoryState, TanukiMemoryAction, typeof settings> = {
  id:"tanuki-memory-quiz", title:"Tanuki Memory Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of the Japanese tanuki-themed children's memory card game.",
  howToPlay:"Tanuki Memory is a Japanese children's memory card game illustrated with adorable tanuki (raccoon dog) characters. Players take turns flipping pairs of face-down cards, trying to recall locations to find matching tanuki illustrations.\n\nThis is a 10-question multiple-choice quiz. Each question gives you 15 seconds to answer. Tap one of the four choices, then press Submit to lock in your answer. You earn 100 base points for every correct answer plus 10 points for each second remaining on the clock — quick correct answers are worth far more than slow ones. Wrong answers earn nothing.\n\nAfter you submit, the correct answer is revealed: green for correct, red for wrong. Press Next to continue. The game ends after all 10 questions.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as TanukiMemorySettings),
  reducer,isTerminal,
  hint: (state: TanukiMemoryState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:TanukiMemoryGame,
};
