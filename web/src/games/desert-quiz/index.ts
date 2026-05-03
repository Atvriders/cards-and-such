import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DesertQuizState, DesertQuizAction, DesertQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const DesertQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.DesertQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const desertQuizPlugin: GamePlugin<DesertQuizState, DesertQuizAction, typeof settings> = {
  id:"desert-quiz", title:"Desert Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of the world's famous deserts. 10 or 20 questions.",
  howToPlay:"Desert Quiz tests your knowledge of the planet's most arid landscapes. Questions cover the giants \u2014 the Sahara, the Gobi, the Atacama, the Antarctic \u2014 along with the countries they cross, the climates they create, and the species (especially that famous saguaro cactus) that thrive within them.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock \u2014 answer quickly to maximize your score. Wrong answers earn nothing.\n\nYou'll be tested on technicalities, too: the world's largest desert is actually Antarctica (a polar desert), not the Sahara. The Atacama is the driest non-polar place on Earth \u2014 some weather stations have never recorded rain. The Sahara stretches across 11 countries. Cold deserts (Gobi, Patagonian) sit alongside hot ones in the same definition: less than 250mm of rainfall per year.\n\nChoose 10 or 20 questions in Settings. From the Outback to the Empty Quarter, see how well your mental map of the world's drylands holds up!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DesertQuizSettings),
  reducer,isTerminal,
  hint: (state: DesertQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:DesertQuizGame,
};
