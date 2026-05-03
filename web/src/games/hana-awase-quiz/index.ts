import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { HanaAwaseState, HanaAwaseAction, HanaAwaseSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const HanaAwaseGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.HanaAwaseGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const hanaAwasePlugin: GamePlugin<HanaAwaseState, HanaAwaseAction, typeof settings> = {
  id:"hana-awase-quiz", title:"Hana Awase Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of Hana Awase, the simplest flower-matching Hanafuda game.",
  howToPlay:"Hana Awase ('flower matching') is the foundational Hanafuda game and the easiest version of the family. Players simply match flower cards from their hand to flower cards on the table by month, with no yaku scoring or betting required. It is the gateway to deeper Hanafuda play, teaching the twelve flower months, the four card grades (Hikari, Tane, Tan, Kasu), and the rhythm of pick-and-match turns.\n\nThis is a 10-question multiple-choice quiz. Each question gives you 15 seconds to answer. Tap one of the four choices, then press Submit to lock in your answer.\n\nYou earn 100 base points for every correct answer plus 10 points for each second remaining on the clock — quick correct answers are worth far more than slow ones. Wrong answers earn nothing.\n\nAfter you submit, the correct answer is revealed: green for correct, red for wrong. Press Next to continue. The game ends after all 10 questions.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as HanaAwaseSettings),
  reducer,isTerminal,
  hint: (state: HanaAwaseState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:HanaAwaseGame,
};
