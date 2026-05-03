import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { AiHistoryQuizState, AiHistoryQuizAction, AiHistoryQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const AiHistoryQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.AiHistoryQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const aiHistoryQuizPlugin: GamePlugin<AiHistoryQuizState, AiHistoryQuizAction, typeof settings> = {
  id:"ai-history-quiz", title:"AI History Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of the Turing test, perceptrons, neural nets, and modern AI.",
  howToPlay:"AI History Quiz challenges you on the development of artificial intelligence: the Dartmouth Workshop, the Turing test, early symbolic AI, expert systems, the AI winters, the rise of machine learning, deep learning's resurgence, and modern landmarks like AlphaGo and large language models. Trace the journey from Turing's 1950 paper to today's AI assistants.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock \u2014 fast, accurate answers earn the highest score. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on.\n\nChoose 10, 20, or 30 questions in Settings. Whether you're an AI researcher, an engineer adopting ML, or simply curious about how machines learn, this quiz will help you appreciate AI's storied past and rapid present!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as AiHistoryQuizSettings),
  reducer,isTerminal,
  hint: (state: AiHistoryQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:AiHistoryQuizGame,
};
