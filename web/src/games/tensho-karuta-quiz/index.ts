import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TenshoKarutaState, TenshoKarutaAction, TenshoKarutaSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const TenshoKarutaGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.TenshoKarutaGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const tenshoKarutaPlugin: GamePlugin<TenshoKarutaState, TenshoKarutaAction, typeof settings> = {
  id:"tensho-karuta-quiz", title:"Tensho Karuta Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of the earliest surviving Portuguese-derived Japanese card deck.",
  howToPlay:"Tensho Karuta is the earliest surviving Portuguese-derived Japanese playing card deck, dating to the late sixteenth century. The Tensho period name reflects when the deck appeared in Japan, brought by Portuguese traders and missionaries.\n\nThis is a 10-question multiple-choice quiz. Each question gives you 15 seconds to answer. Tap one of the four choices, then press Submit to lock in your answer. You earn 100 base points for every correct answer plus 10 points for each second remaining on the clock — quick correct answers are worth far more than slow ones. Wrong answers earn nothing.\n\nAfter you submit, the correct answer is revealed: green for correct, red for wrong. Press Next to continue. The game ends after all 10 questions.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as TenshoKarutaSettings),
  reducer,isTerminal,
  hint: (state: TenshoKarutaState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:TenshoKarutaGame,
};
