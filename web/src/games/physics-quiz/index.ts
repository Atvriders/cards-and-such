import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PhysicsQuizState, PhysicsQuizAction, PhysicsQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const PhysicsQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.PhysicsQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const physicsQuizPlugin: GamePlugin<PhysicsQuizState, PhysicsQuizAction, typeof settings> = {
  id:"physics-quiz", title:"Physics Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of Newton, Einstein, mechanics, and relativity.",
  howToPlay:"Physics Quiz challenges you on the laws that govern our universe: Newton's classical mechanics, Einstein's relativity, electromagnetism, quantum mechanics, thermodynamics, and the great experiments and thinkers behind them. Questions span everything from F=ma to E=mc^2, from the speed of light to the Heisenberg uncertainty principle.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock \u2014 quick thinking earns the highest score. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on.\n\nChoose 10, 20, or 30 questions in Settings. Whether you're a high-school physics student or a self-taught enthusiast, this quiz will challenge your understanding of the universe's deepest workings!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as PhysicsQuizSettings),
  reducer,isTerminal,
  hint: (state: PhysicsQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:PhysicsQuizGame,
};
