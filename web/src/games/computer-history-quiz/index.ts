import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ComputerHistoryQuizState, ComputerHistoryQuizAction, ComputerHistoryQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const ComputerHistoryQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.ComputerHistoryQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const computerHistoryQuizPlugin: GamePlugin<ComputerHistoryQuizState, ComputerHistoryQuizAction, typeof settings> = {
  id:"computer-history-quiz", title:"Computer History Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of Babbage, Turing, ENIAC, and the founding eras of computing.",
  howToPlay:"Computer History Quiz challenges you on the giants who built the digital age: Charles Babbage's Difference Engine, Ada Lovelace's first algorithm, Alan Turing's universal machine, ENIAC and Bletchley Park, the rise of IBM, the personal-computer revolution led by Apple and Microsoft, and the moments that defined how we got from punch cards to today's pocket supercomputers.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock \u2014 fast, accurate answers earn the highest score. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on.\n\nChoose 10, 20, or 30 questions in Settings. Whether you're a longtime techie, a CS student, or just curious about how computers came to be, this quiz will trace the great milestones of the digital era!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as ComputerHistoryQuizSettings),
  reducer,isTerminal,
  hint: (state: ComputerHistoryQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:ComputerHistoryQuizGame,
};
