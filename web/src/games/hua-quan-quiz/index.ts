import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { HuaQuanState, HuaQuanAction, HuaQuanSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const HuaQuanGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.HuaQuanGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const huaQuanGamePlugin: GamePlugin<HuaQuanState, HuaQuanAction, typeof settings> = {
  id:"hua-quan-quiz", title:"Hua Quan (Guess the Cup) Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of the Chinese finger-guessing drinking game.",
  howToPlay:"Hua Quan, also called Guess the Cup, is a Chinese finger-guessing drinking game. Two players simultaneously throw out a number of fingers and shout a guessed total, while drinking tea or rice wine if they guess wrong.\n\nThis is a 10-question multiple-choice quiz. Each question gives you 15 seconds to answer. Tap one of the four choices, then press Submit to lock in your answer. You earn 100 base points for every correct answer plus 10 points for each second remaining on the clock — quick correct answers are worth far more than slow ones. Wrong answers earn nothing.\n\nAfter you submit, the correct answer is revealed: green for correct, red for wrong. Press Next to continue. The game ends after all 10 questions.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as HuaQuanSettings),
  reducer,isTerminal,
  hint: (state: HuaQuanState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:HuaQuanGame,
};
