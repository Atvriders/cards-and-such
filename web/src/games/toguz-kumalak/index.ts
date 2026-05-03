import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ToguzKumalakState, ToguzKumalakAction, ToguzKumalakSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const ToguzKumalakGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.ToguzKumalakGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const toguzKumalakPlugin: GamePlugin<ToguzKumalakState, ToguzKumalakAction, typeof settings> = {
  id:"toguz-kumalak", title:"Toguz Kumalak", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Trivia about Toguz Kumalak, the Kazakh/Kyrgyz mancala variant.",
  howToPlay:"Toguz Kumalak Trivia is a ten-question quiz about Toguz Kumalak (also Toguz Korgool), a traditional Central Asian mancala from Kazakhstan and Kyrgyzstan. The board has 2 rows × 9 pits (18 pits total) with 81 seeds (kumalak). Players sow seeds counterclockwise, beginning with one seed left in the source pit. Captures occur when the final seed lands in an opponent's pit and the resulting count is even. A captured pit's seeds go to the player's store. The unique 'tuzdyk' rule lets each player claim a special pit on the opponent's side as their personal seed-store, but each player can have only one tuzdyk and they can't be in directly opposite positions. The first to capture more than 81 seeds (a majority) wins. Each question tests rules and tuzdyk play. Tap an answer and Submit; correct answers earn 100 base points plus 10 per second remaining on the 15-second timer. Wrong answers reveal the correct option. After ten questions your final score is shown.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as ToguzKumalakSettings),
  reducer,isTerminal,hint: (state: ToguzKumalakState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-toguz-kumalak-answer-0"]', pulses: 3 } : null, component:ToguzKumalakGame,
};
