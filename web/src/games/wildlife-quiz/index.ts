import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { WildlifeQuizState, WildlifeQuizAction, WildlifeQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const WildlifeQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.WildlifeQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const wildlifeQuizPlugin: GamePlugin<WildlifeQuizState, WildlifeQuizAction, typeof settings> = {
  id:"wildlife-quiz", title:"Wildlife Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Animals across continents — test your wildlife knowledge.",
  howToPlay:"Wildlife Quiz tests your knowledge of animals around the world. From African big-fives to Arctic carnivores, rainforest insects, and ocean giants, this quiz spans habitats and species. Some questions touch on conservation, taxonomy, behavior, and famous wildlife regions.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on.\n\nChoose 10, 20, or 30 questions in Settings. Roam the world — what do you remember?",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as WildlifeQuizSettings),
  reducer,isTerminal,
  hint: (state: WildlifeQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:WildlifeQuizGame,
};
