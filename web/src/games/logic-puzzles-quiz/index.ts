import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { LogicPuzzlesQuizState, LogicPuzzlesQuizAction, LogicPuzzlesQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const LogicPuzzlesQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.LogicPuzzlesQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const logicPuzzlesQuizPlugin: GamePlugin<LogicPuzzlesQuizState, LogicPuzzlesQuizAction, typeof settings> = {
  id:"logic-puzzles-quiz", title:"Logic Puzzles Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Intro logic and syllogisms: deduction, induction, valid inference.",
  howToPlay:"Logic Puzzles Quiz exercises your deductive and inductive reasoning. Questions feature classic syllogisms, valid and invalid argument forms, simple knights-and-knaves puzzles, basic Boolean logic, contrapositives, and some short truth-table evaluations. The goal is to test your reasoning under time pressure, not your math chops.\n\nYou have 15 seconds per question. Correct answers award 100 base points plus 10 per second remaining. Wrong answers earn zero but the right answer is revealed.\n\nTap a choice and press Submit. Green means correct, red means wrong. Press Next to advance.\n\nChoose 10 or 20 questions in Settings. Whether you're prepping for the LSAT, GRE, or just love the click of a clean deduction, this quiz will exercise the logical muscle. Read each premise carefully and think before you tap — sometimes the most obvious answer is a trap!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as LogicPuzzlesQuizSettings),
  reducer,isTerminal,
  hint: (state: LogicPuzzlesQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:LogicPuzzlesQuizGame,
};
