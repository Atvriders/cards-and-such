import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { OnepieceQuizState, OnepieceQuizAction, OnepieceQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const OnepieceQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.OnepieceQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const onepieceQuizPlugin: GamePlugin<OnepieceQuizState, OnepieceQuizAction, typeof settings> = {
  id:"onepiece-quiz", title:"One Piece Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your One Piece knowledge: pirates, Devil Fruits, the Grand Line, and the Straw Hat crew.",
  howToPlay:`One Piece Quiz tests your knowledge of Eiichiro Oda's epic pirate adventure. Questions cover the Straw Hat Pirates, the Grand Line, the New World, the Yonko, the Marines, the Seven Warlords, the World Government, Devil Fruits in all three categories, the Will of D, the Void Century, and Luffy's quest to find the legendary One Piece and become King of the Pirates.

You have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers and timeouts earn nothing.

Tap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move to the next question.

Choose 10 or 20 questions in Settings. From the East Blue to Wano, see how well you know the world's longest-running pirate saga. Set sail!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as OnepieceQuizSettings),
  reducer,isTerminal,
  hint: (state: OnepieceQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:OnepieceQuizGame,
};
