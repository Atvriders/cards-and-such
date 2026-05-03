import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { IrohaKarutaState, IrohaKarutaAction, IrohaKarutaSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const IrohaKarutaGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.IrohaKarutaGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const irohaKarutaPlugin: GamePlugin<IrohaKarutaState, IrohaKarutaAction, typeof settings> = {
  id:"iroha-karuta-quiz", title:"Iroha Karuta Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of Iroha Karuta, Japan's classic proverb-matching card game.",
  howToPlay:"Iroha Karuta is a traditional Japanese matching game played mostly during New Year. The deck is split into two halves: 48 'reading' (yomi) cards each beginning with a kana from the Iroha poem, and 48 matching 'picture' (e) cards. A reader recites a proverb starting with that kana while players race to grab the matching picture card. The player with the most cards wins. Iroha Karuta teaches Japanese phonetics and proverbs to children.\n\nThis is a 10-question multiple-choice quiz. Each question gives you 15 seconds to answer. Tap one of the four choices, then press Submit to lock in your answer.\n\nYou earn 100 base points for every correct answer plus 10 points for each second remaining on the clock — quick correct answers are worth far more than slow ones. Wrong answers earn nothing.\n\nAfter you submit, the correct answer is revealed: green for correct, red for wrong. Press Next to continue. The game ends after all 10 questions.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as IrohaKarutaSettings),
  reducer,isTerminal,
  hint: (state: IrohaKarutaState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:IrohaKarutaGame,
};
