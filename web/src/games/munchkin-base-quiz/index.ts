import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MunchkinBaseQuizState, MunchkinBaseQuizAction, MunchkinBaseQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const MunchkinBaseQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.MunchkinBaseQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const munchkinBaseQuizPlugin: GamePlugin<MunchkinBaseQuizState, MunchkinBaseQuizAction, typeof settings> = {
  id:"munchkin-base-quiz", title:"Munchkin Base Trivia", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Trivia about Munchkin, the original satirical dungeon-delve card game.",
  howToPlay:"Munchkin Base Trivia is a ten-question quiz about Munchkin, the genre-skewering dungeon card game by Steve Jackson where players race to be the first to reach Level 10 by killing monsters, looting treasure, and stabbing each other in the back. Each round you'll be tested on the publisher Steve Jackson Games, its illustrator John Kovalic, the card types (Door, Treasure), the level cap, and the running gag of pun-named cards. Tap your answer and press Submit; a correct answer awards 100 base points plus 10 per second remaining on the 15-second timer. A wrong answer reveals the correct option and locks the round; press Next to continue. After ten questions, your final score is displayed. Munchkin's tongue-in-cheek take on D&D culture launched a sprawling franchise with dozens of expansions — see how much trivia you can summon.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as MunchkinBaseQuizSettings),
  reducer,isTerminal,
  hint: (state: MunchkinBaseQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:MunchkinBaseQuizGame,
};
