import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PixarFilmsQuizState, PixarFilmsQuizAction, PixarFilmsQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const PixarFilmsQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.PixarFilmsQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const pixarFilmsQuizPlugin: GamePlugin<PixarFilmsQuizState, PixarFilmsQuizAction, typeof settings> = {
  id:"pixar-films-quiz", title:"Pixar Films Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of Pixar — Toy Story, Finding Nemo, Up, Inside Out, and more.",
  howToPlay:`Pixar Films Quiz tests your knowledge of the studio that revolutionized animation. From 1995's 'Toy Story', the first ever fully computer-animated feature, through to recent hits like 'Soul' and 'Luca', you'll be quizzed on characters, voice actors, plots, and Pixar trivia. Expect everything from Buzz and Woody to Sulley, Mike, Lightning McQueen, Remy, Carl, and the colorful emotions of 'Inside Out'.\n\nYou have 15 seconds per question. Each correct answer earns 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the correct answer is always revealed before you continue. Press Next to advance.\n\nChoose 10, 20, or 30 questions in Settings. To infinity, and beyond!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as PixarFilmsQuizSettings),
  reducer,isTerminal,
  hint: (state: PixarFilmsQuizState): HintTarget | null => {
    if (state.phase !== "playing") return null;
    return { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 };
  },
  component:PixarFilmsQuizGame,
};
