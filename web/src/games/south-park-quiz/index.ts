import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SouthParkState, SouthParkAction, SouthParkSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const SouthParkQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.SouthParkQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const southParkQuizPlugin: GamePlugin<SouthParkState, SouthParkAction, typeof settings> = {
  id:"south-park-quiz", title:"South Park Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of South Park, Trey Parker and Matt Stone's animated satire.",
  howToPlay:"South Park Quiz tests your knowledge of Trey Parker and Matt Stone's biting animated satire, set in the small mountain town of South Park, Colorado. Questions cover the main four — Stan, Kyle, Cartman, and Kenny — plus Butters, Timmy, Tweek, Craig, Token, Mr. Garrison, Chef, Big Gay Al, Mr. Mackey, Towelie, and the rest of the bizarre supporting cast.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue.\n\nChoose 10, 20, or 30 questions in Settings. Oh my god, you killed Kenny — go win!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as SouthParkSettings),
  reducer,isTerminal,
  hint: (state: SouthParkState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:SouthParkQuizGame,
};
