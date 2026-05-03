import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CoppolaQuizState, CoppolaQuizAction, CoppolaQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const CoppolaQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.CoppolaQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const coppolaQuizPlugin: GamePlugin<CoppolaQuizState, CoppolaQuizAction, typeof settings> = {
  id:"coppola-quiz", title:"Francis Ford Coppola Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Godfather, Apocalypse Now, Conversation — the films of Francis Ford Coppola.",
  howToPlay:"Francis Ford Coppola Quiz tests your knowledge with a series of multiple-choice questions. Each question gives you four options labeled A through D — tap the answer you believe is correct, then press Submit to lock it in.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 bonus points for every second remaining on the timer, so quick thinking really pays off. Wrong answers and timeouts score zero. Don't panic when the timer turns red at five seconds remaining — pick your best guess and submit.\n\nCorrect answers glow green, incorrect picks turn red, and the right answer is always revealed before you continue. Press Next to advance to the next question, or Finish on the final question to see your final tally and accuracy stats.\n\nIn Settings you can choose 10, 20, or 30 questions per game. Whether you're a casual fan or an obsessive expert, this quiz will challenge what you know — and maybe teach you something new.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CoppolaQuizSettings),
  reducer,isTerminal,
  hint: (state: CoppolaQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:CoppolaQuizGame,
};
