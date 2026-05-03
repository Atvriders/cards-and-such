import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SpacexHistoryQuizState, SpacexHistoryQuizAction, SpacexHistoryQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const SpacexHistoryQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.SpacexHistoryQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const spacexHistoryQuizPlugin: GamePlugin<SpacexHistoryQuizState, SpacexHistoryQuizAction, typeof settings> = {
  id:"spacex-history-quiz", title:"SpaceX History Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of SpaceX's missions, milestones, and rocket family.",
  howToPlay:"SpaceX History Quiz tests your knowledge of Elon Musk's space company. Questions cover the 2002 founding, the Falcon 1's troubled early launches, the historic 2008 first orbit, the Falcon 9 reusable rocket era, Dragon spacecraft, the Crew Dragon astronaut launches, Starship's wild test flights, Starlink, and the path to Mars.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on.\n\nChoose 10, 20, or 30 questions in Settings. From the first Falcon 1 to Starship, this quiz tests every milestone.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as SpacexHistoryQuizSettings),
  reducer,isTerminal,
  hint: (state: SpacexHistoryQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:SpacexHistoryQuizGame,
};
