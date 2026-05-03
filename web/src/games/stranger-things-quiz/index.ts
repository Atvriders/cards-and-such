import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { StrangerThingsState, StrangerThingsAction, StrangerThingsSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const StrangerThingsQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.StrangerThingsQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const strangerThingsQuizPlugin: GamePlugin<StrangerThingsState, StrangerThingsAction, typeof settings> = {
  id:"stranger-things-quiz", title:"Stranger Things Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of Stranger Things: Hawkins, the Upside Down, and Eleven.",
  howToPlay:"Stranger Things Quiz tests your knowledge of the Duffer Brothers' nostalgic Netflix sci-fi/horror series set in 1980s Hawkins, Indiana. Questions cover Eleven, Mike, Will, Lucas, Dustin, Max, Nancy, Steve, Robin, Jonathan, Hopper, Joyce, and the rest, plus the Upside Down, Demogorgons, the Mind Flayer, Vecna, and the various Hawkins Lab conspiracies.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red.\n\nChoose 10, 20, or 30 questions in Settings. Friends don't lie — but they do quiz!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as StrangerThingsSettings),
  reducer,isTerminal,
  hint: (state: StrangerThingsState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:StrangerThingsQuizGame,
};
