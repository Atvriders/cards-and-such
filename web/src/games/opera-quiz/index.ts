import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { OperaQuizState, OperaQuizAction, OperaQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const OperaQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.OperaQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const operaQuizPlugin: GamePlugin<OperaQuizState, OperaQuizAction, typeof settings> = {
  id:"opera-quiz", title:"Opera Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Opera through the ages: Verdi, Puccini, Wagner, Mozart, and more.",
  howToPlay:`Opera Quiz takes you across four centuries of operatic history. From Monteverdi and Handel to Mozart and Rossini, on through Verdi and Wagner, Puccini and Strauss, expect questions on famous arias, librettists, premieres, opera houses, and the singers who made the stage their home.

You have 15 seconds per question. Each correct answer awards 100 base points plus 10 points per second remaining — quick recall pays off. Wrong answers earn nothing.

Tap a choice and press Submit. Correct answers glow green; wrong ones turn red, and the right answer is shown before you advance. Press Next to move on.

Choose 10, 20, or 30 questions in Settings. Whether you've stood at La Scala or only seen The Met in HD, this quiz is your bel canto warm-up!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as OperaQuizSettings),
  reducer,isTerminal,
  hint: (state: OperaQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:OperaQuizGame,
};
