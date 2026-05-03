import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { AlgebraQuizState, AlgebraQuizAction, AlgebraQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const AlgebraQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.AlgebraQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const algebraQuizPlugin: GamePlugin<AlgebraQuizState, AlgebraQuizAction, typeof settings> = {
  id:"algebra-quiz", title:"Algebra Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Algebra fundamentals: solve, simplify, factor, expand.",
  howToPlay:"Algebra Quiz tests your fluency with variables, equations, and expressions. Questions cover solving linear equations, simplifying expressions, distributive law, factoring quadratics, exponents, FOIL multiplication, systems of equations, function evaluation, and a few inequalities. All problems are designed to be quick mental work or short-paper computations.\n\nYou have 15 seconds per question. Correct answers earn 100 base points plus 10 per second remaining. Wrong answers earn zero but the correct answer is revealed.\n\nTap a choice and press Submit. Green is correct, red is wrong. Press Next to continue.\n\nChoose 10 or 20 questions in Settings. Whether you're prepping for high school finals, brushing up for the SAT, or just love a clean algebraic manipulation, this quiz will sharpen your skills. No calculators — keep it mental and stay sharp!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as AlgebraQuizSettings),
  reducer,isTerminal,
  hint: (state: AlgebraQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:AlgebraQuizGame,
};
