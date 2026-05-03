import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CartoonsQuizState, CartoonsQuizAction, CartoonsQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const CartoonsQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.CartoonsQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const cartoonsQuizPlugin: GamePlugin<CartoonsQuizState, CartoonsQuizAction, typeof settings> = {
  id:"cartoons-quiz", title:"Cartoons Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of cartoons — Looney Tunes, Simpsons, SpongeBob, and more.",
  howToPlay:`Cartoons Quiz tests your knowledge of animated TV shows from every era. From classic Warner Bros 'Looney Tunes' (Bugs Bunny, Daffy, Tweety) and Hanna-Barbera favorites (Flintstones, Jetsons, Scooby-Doo) through 'The Simpsons', 'Family Guy', 'South Park', 'SpongeBob SquarePants', and 'Rick and Morty', you'll be quizzed on characters, catchphrases, creators, and iconic moments.\n\nYou have 15 seconds per question. Each correct answer earns 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the correct answer is always revealed before you continue. Press Next to advance.\n\nChoose 10, 20, or 30 questions in Settings. That's all folks!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CartoonsQuizSettings),
  reducer,isTerminal,
  hint: (state: CartoonsQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:CartoonsQuizGame,
};
