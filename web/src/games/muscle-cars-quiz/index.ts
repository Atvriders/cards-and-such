import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MuscleCarsQuizState, MuscleCarsQuizAction, MuscleCarsQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const MuscleCarsQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.MuscleCarsQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const muscleCarsQuizPlugin: GamePlugin<MuscleCarsQuizState, MuscleCarsQuizAction, typeof settings> = {
  id:"muscle-cars-quiz", title:"Muscle Cars Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of American muscle cars: GTOs, Chargers, Mustangs, and more.",
  howToPlay:"Muscle Cars Quiz puts you in the driver's seat of America's golden age of horsepower. From the 1964 Pontiac GTO that started it all to the Hemi Cudas, Boss Mustangs, Chevelle SSs, and Trans Ams that dominated drag strips and Main Street alike, this quiz covers the big-block beasts and small-block screamers of the muscle era.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on.\n\nChoose 10, 20, or 30 questions in Settings. Strap in, hit the loud pedal, and let's see how much horsepower lore you've stored under the hood.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as MuscleCarsQuizSettings),
  reducer,isTerminal,
  hint: (state: MuscleCarsQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:MuscleCarsQuizGame,
};
