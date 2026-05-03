import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TrialByTrolleyQuizState, TrialByTrolleyQuizAction, TrialByTrolleyQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const TrialByTrolleyQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.TrialByTrolleyQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const trialByTrolleyQuizPlugin: GamePlugin<TrialByTrolleyQuizState, TrialByTrolleyQuizAction, typeof settings> = {
  id:"trial-by-trolley-quiz", title:"Trial by Trolley Trivia", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Trivia about Trial by Trolley, the moral dilemma trolley problem party card game.",
  howToPlay:"Trial by Trolley Trivia is a ten-question quiz devoted to the morbid party card game in which a Conductor judge listens as two teams plead their case for which rail track of victims the runaway trolley should mow down. Each round you'll be asked about the game's publisher Cyanide & Happiness, the card types — innocent, guilty, and modifier — and the rotating Conductor role, plus its absurd humour and adult themes. Tap the answer you believe is correct and press Submit. A correct answer awards 100 base points plus 10 points per second remaining on the 15-second timer, so quick play is rewarded. A wrong answer reveals the correct option and locks the round; press Next to continue. After ten questions, your final score appears. Trial by Trolley turns the classical philosophy thought experiment into a debate-fueled riot — see how well you remember its grim glee.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as TrialByTrolleyQuizSettings),
  reducer,isTerminal,
  hint: (state: TrialByTrolleyQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:TrialByTrolleyQuizGame,
};
