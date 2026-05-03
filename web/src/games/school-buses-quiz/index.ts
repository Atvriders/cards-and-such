import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SchoolBusesQuizState, SchoolBusesQuizAction, SchoolBusesQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const SchoolBusesQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.SchoolBusesQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const schoolBusesQuizPlugin: GamePlugin<SchoolBusesQuizState, SchoolBusesQuizAction, typeof settings> = {
  id:"school-buses-quiz", title:"School Buses Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of yellow school buses and pupil transport.",
  howToPlay:"School Buses Quiz covers the ubiquitous yellow vehicles that move millions of students every school day. From Type A vans to Type D transit-style coaches, color regulations, safety standards, and the engines that drive them, this quiz dives into a beloved transportation icon known the world over.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on.\n\nChoose 10, 20, or 30 questions in Settings. From flashing red lights to safety mirrors, every detail has a story — let's see how much you know!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as SchoolBusesQuizSettings),
  reducer,isTerminal,
  hint: (state: SchoolBusesQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:SchoolBusesQuizGame,
};
