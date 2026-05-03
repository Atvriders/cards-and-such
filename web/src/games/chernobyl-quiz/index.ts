import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ChernobylQuizState, ChernobylQuizAction, ChernobylQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const ChernobylQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.ChernobylQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const chernobylQuizPlugin: GamePlugin<ChernobylQuizState, ChernobylQuizAction, typeof settings> = {
  id:"chernobyl-quiz", title:"Chernobyl Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of the 1986 Chernobyl nuclear disaster.",
  howToPlay:"Chernobyl Quiz tests your knowledge of the worst nuclear accident in history. Questions cover the reactor design, the safety test that went catastrophically wrong on April 26, 1986, the heroic actions of the firefighters and liquidators, the evacuation of Pripyat, and the long-term environmental and health consequences. You'll be asked about reactor 4, the RBMK design, the sarcophagus, and the modern Exclusion Zone.\\n\\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.\\n\\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on. Choose 10, 20, or 30 questions in Settings.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as ChernobylQuizSettings),
  reducer,isTerminal,
  hint: (state: ChernobylQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:ChernobylQuizGame,
};
