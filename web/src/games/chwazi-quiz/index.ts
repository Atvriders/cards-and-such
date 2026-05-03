import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ChwaziState, ChwaziAction, ChwaziSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const ChwaziGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.ChwaziGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const chwaziGamePlugin: GamePlugin<ChwaziState, ChwaziAction, typeof settings> = {
  id:"chwazi-quiz", title:"Chwazi Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of the Korean touch-screen finger selection app Chwazi.",
  howToPlay:"Chwazi is a Korean decision-randomizer mini-game best known as a touch-screen app. Players touch the screen with their fingers; after a few seconds the app randomly highlights one finger to make a fair, fast group decision.\n\nThis is a 10-question multiple-choice quiz. Each question gives you 15 seconds to answer. Tap one of the four choices, then press Submit to lock in your answer. You earn 100 base points for every correct answer plus 10 points for each second remaining on the clock — quick correct answers are worth far more than slow ones. Wrong answers earn nothing.\n\nAfter you submit, the correct answer is revealed: green for correct, red for wrong. Press Next to continue. The game ends after all 10 questions.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as ChwaziSettings),
  reducer,isTerminal,
  hint: (state: ChwaziState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:ChwaziGame,
};
