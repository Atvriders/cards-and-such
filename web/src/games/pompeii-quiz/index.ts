import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PompeiiQuizState, PompeiiQuizAction, PompeiiQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const PompeiiQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.PompeiiQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const pompeiiQuizPlugin: GamePlugin<PompeiiQuizState, PompeiiQuizAction, typeof settings> = {
  id:"pompeii-quiz", title:"Pompeii Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of the eruption of Mount Vesuvius and the buried city of Pompeii.",
  howToPlay:"Pompeii Quiz tests your knowledge of the famous Roman city destroyed by Mount Vesuvius. Questions cover the eruption of 79 AD, the eyewitness account of Pliny the Younger, the death of Pliny the Elder, the city's rediscovery in the 18th century, and the famous plaster casts of victims. You'll be asked about Herculaneum, Stabiae, archaeological techniques, frescoes, and the daily life preserved beneath the ash.\\n\\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.\\n\\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on. Choose 10, 20, or 30 questions in Settings.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as PompeiiQuizSettings),
  reducer,isTerminal,
  hint: (state: PompeiiQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:PompeiiQuizGame,
};
