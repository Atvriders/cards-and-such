import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CapitalsQuizState, CapitalsQuizAction, CapitalsQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const CapitalsQuiz = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.CapitalsQuiz as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const capitalsQuizPlugin: GamePlugin<CapitalsQuizState, CapitalsQuizAction, typeof settings> = {
  id:"capitals-quiz", title:"Capitals Quiz", category:"board",
  players:{min:1,max:1,multiplayer:false},
  description:"Name the capital city! A world geography challenge covering 20 countries.",
  howToPlay:`Capitals Quiz tests your knowledge of the world's capital cities. Many people know that Paris is France's capital, but what about Australia, Brazil, or South Africa? The answers might surprise you!

Select one of four city choices and press Submit. Each correct answer earns 100 points. After submitting, the correct capital is revealed so you can add it to your geography knowledge.

Countries covered span all inhabited continents: Australia (Canberra, not Sydney!), Brazil (Brasília, not Rio!), Canada, Japan, South Africa, Germany, India, Mexico, Egypt, Argentina, Russia, Nigeria, Turkey, Indonesia, South Korea, Spain, Netherlands, New Zealand, Pakistan, and Switzerland.

Use Settings to choose 10 or 20 questions. Questions are randomly selected and answer choices are shuffled every game. Many capitals are surprising — the largest city is often not the capital. This quiz will challenge even seasoned geography enthusiasts. How many capitals do you really know?`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CapitalsQuizSettings),
  reducer, isTerminal, 
  hint: (state: CapitalsQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:CapitalsQuiz,
};
