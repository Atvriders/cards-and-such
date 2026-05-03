import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GoStopState, GoStopAction, GoStopSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const GoStopGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.GoStopGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const goStopPlugin: GamePlugin<GoStopState, GoStopAction, typeof settings> = {
  id:"go-stop-quiz", title:"Go-Stop Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of Go-Stop, the Korean Hwatu matching gambling game.",
  howToPlay:"Go-Stop is the most popular Korean card game, played with a Hwatu deck (the Korean equivalent of Hanafuda). Players match flower cards from their hands and the table to score points. Once a player reaches the threshold (commonly 7 points), they may either say 'Go!' to keep playing for more, or 'Stop!' to lock in the win. Saying Go raises both the reward and the risk — opponents who later score the threshold can take the doubled pot.\n\nThis is a 10-question multiple-choice quiz. Each question gives you 15 seconds to answer. Tap one of the four choices, then press Submit to lock in your answer.\n\nYou earn 100 base points for every correct answer plus 10 points for each second remaining on the clock — quick correct answers are worth far more than slow ones. Wrong answers earn nothing.\n\nAfter you submit, the correct answer is revealed: green for correct, red for wrong. Press Next to continue. The game ends after all 10 questions.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as GoStopSettings),
  reducer,isTerminal,
  hint: (state: GoStopState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:GoStopGame,
};
