import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { NumberRecallState, NumberRecallAction, NumberRecallSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const NumberRecall = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.NumberRecall as unknown as React.ComponentType<unknown> })));
const settings = { rounds: { kind:"enum" as const, label:"Rounds", options:["5","10"] as const, default:"5" as const } } as const;
type S = SettingsOf<typeof settings>;
export const numberRecallPlugin: GamePlugin<NumberRecallState, NumberRecallAction, typeof settings> = {
  id:"number-recall", title:"Number Recall", category:"board",
  players:{min:1,max:1,multiplayer:false},
  description:"Digits flash one at a time — memorize them and type them back in order!",
  howToPlay:`Number Recall is a digit memory game. Each round a sequence of numbers flashes on screen one digit at a time. Watch them carefully, then click the number buttons to reproduce the sequence in order.

Start with a 3-digit sequence. Get it right and the next round has one more digit. Get it wrong and the sequence shortens by one (minimum 3). Each correct recall earns 40 points per digit in the sequence.

Digits 0-9 are all used. The sequence auto-advances every 0.9 seconds — focus! Memory techniques like chunking (grouping digits into pairs or triples) can help with longer sequences.

Use Settings to play 5 or 10 rounds. The challenge increases as sequences grow — can you recall a 10-digit number? Average humans can hold about 7 digits in working memory. Test your personal limit!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as NumberRecallSettings),
  reducer, isTerminal, hint: (state: NumberRecallState): HintTarget | null => (state.phase === "input" ? { selector: ".memory-btn", pulses: 3 } : null), component:NumberRecall,
};
