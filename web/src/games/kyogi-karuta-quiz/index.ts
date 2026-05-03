import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { KyogiKarutaState, KyogiKarutaAction, KyogiKarutaSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const KyogiKarutaGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.KyogiKarutaGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const kyogiKarutaPlugin: GamePlugin<KyogiKarutaState, KyogiKarutaAction, typeof settings> = {
  id:"kyogi-karuta-quiz", title:"Kyogi Karuta Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of Kyogi Karuta, Japan's competitive tournament karuta.",
  howToPlay:"Kyogi Karuta is the formal competitive form of Hyakunin Isshu karuta, played one-on-one on tatami mats. Each player arranges 25 of 100 cards in a controlled territory in front of them; the reader recites poems and players strike to take the matching cards. Cards may also be 'sent' to the opponent's territory after a successful strike. Top Kyogi Karuta competitors react in milliseconds and can identify poems on a single syllable.\n\nThis is a 10-question multiple-choice quiz. Each question gives you 15 seconds to answer. Tap one of the four choices, then press Submit to lock in your answer.\n\nYou earn 100 base points for every correct answer plus 10 points for each second remaining on the clock — quick correct answers are worth far more than slow ones. Wrong answers earn nothing.\n\nAfter you submit, the correct answer is revealed: green for correct, red for wrong. Press Next to continue. The game ends after all 10 questions.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as KyogiKarutaSettings),
  reducer,isTerminal,
  hint: (state: KyogiKarutaState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:KyogiKarutaGame,
};
