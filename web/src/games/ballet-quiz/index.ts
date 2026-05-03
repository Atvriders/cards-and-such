import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BalletQuizState, BalletQuizAction, BalletQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const BalletQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.BalletQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const balletQuizPlugin: GamePlugin<BalletQuizState, BalletQuizAction, typeof settings> = {
  id:"ballet-quiz", title:"Ballet Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Ballet history: from Petipa to Balanchine, Nutcracker to Swan Lake.",
  howToPlay:`Ballet Quiz tours the world of classical and contemporary dance. Questions span the great choreographers — Petipa, Balanchine, Ashton, MacMillan, Robbins, and Pina Bausch — as well as legendary dancers (Pavlova, Nureyev, Fonteyn, Baryshnikov), the major companies, and the music behind the steps (Tchaikovsky, Stravinsky, Prokofiev).

You have 15 seconds per question. Correct answers award 100 base points plus 10 per second left on the clock. Wrong answers earn nothing.

Tap a choice and press Submit. Correct answers glow green; wrong ones turn red, and the right answer is revealed before you continue. Press Next to advance.

Choose 10, 20, or 30 questions in Settings. Whether you take class or you only know the Nutcracker holiday matinée, lace up those slippers — and let's pirouette into a great quiz!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as BalletQuizSettings),
  reducer,isTerminal,
  hint: (state: BalletQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:BalletQuizGame,
};
