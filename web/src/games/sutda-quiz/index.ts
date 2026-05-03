import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SutdaState, SutdaAction, SutdaSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const SutdaGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.SutdaGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const sutdaPlugin: GamePlugin<SutdaState, SutdaAction, typeof settings> = {
  id:"sutda-quiz", title:"Sutda Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of Sutda, the Korean Seotda variant.",
  howToPlay:"Sutda is a Korean gambling card game very closely related to Seotda. Both use the same 20-card Hwatu deck (months 1–10, two cards each), and both deal two cards per player and rank hands by special names. Sutda differs in subtle hand combinations and house rules — for example, the precise list of allowed combinations and tiebreakers may vary. Sutda is most often played at gatherings and was popularised in Korean cinema by films like 'Tazza' and 'Tazza: The Hidden Card'.\n\nThis is a 10-question multiple-choice quiz. Each question gives you 15 seconds to answer. Tap one of the four choices, then press Submit to lock in your answer.\n\nYou earn 100 base points for every correct answer plus 10 points for each second remaining on the clock — quick correct answers are worth far more than slow ones. Wrong answers earn nothing.\n\nAfter you submit, the correct answer is revealed: green for correct, red for wrong. Press Next to continue. The game ends after all 10 questions.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as SutdaSettings),
  reducer,isTerminal,
  hint: (state: SutdaState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:SutdaGame,
};
