import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CatCareQuizState, CatCareQuizAction, CatCareQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const CatCareQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.CatCareQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const catCareQuizPlugin: GamePlugin<CatCareQuizState, CatCareQuizAction, typeof settings> = {
  id:"cat-care-quiz", title:"Cat Care Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Litter, vaccines, scratching — test your feline care know-how.",
  howToPlay:"Cat Care Quiz tests your knowledge of feline health, litter, behavior, nutrition, and grooming. Cats are independent but still deserve attentive care — from kitten socialization and core vaccines to dental disease, environmental enrichment, and recognizing common illnesses, this quiz covers the essentials.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on.\n\nChoose 10, 20, or 30 questions in Settings. Purr-fect your knowledge!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CatCareQuizSettings),
  reducer,isTerminal,
  hint: (state: CatCareQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:CatCareQuizGame,
};
