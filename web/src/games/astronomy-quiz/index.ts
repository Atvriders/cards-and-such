import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { AstronomyQuizState, AstronomyQuizAction, AstronomyQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const AstronomyQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.AstronomyQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const astronomyQuizPlugin: GamePlugin<AstronomyQuizState, AstronomyQuizAction, typeof settings> = {
  id:"astronomy-quiz", title:"Astronomy Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of planets, stars, galaxies, and famous space missions.",
  howToPlay:`Astronomy Quiz challenges you on the wonders of the cosmos: planets, moons, stars, galaxies, and the storied missions that have explored them. Questions cover everything from the heliocentric revolution and Kepler's laws to the Apollo Moon landings, the Hubble and James Webb space telescopes, and the surprises of dwarf planets and exoplanets.

You have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.

Tap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on.

Choose 10, 20, or 30 questions in Settings. Whether you're a casual stargazer or a seasoned amateur astronomer, this quiz will take you on a tour of the universe — one question at a time!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as AstronomyQuizSettings),
  reducer,isTerminal,
  hint: (state: AstronomyQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:AstronomyQuizGame,
};
