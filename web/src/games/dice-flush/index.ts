import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceFlushState, DiceFlushAction, DiceFlushSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const DiceFlush = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.DiceFlush as unknown as React.ComponentType<unknown> })));
const settings = { rounds: { kind:"enum" as const, label:"Rounds", options:["5","10"] as const, default:"5" as const } } as const;
type S = SettingsOf<typeof settings>;
export const diceFlushPlugin: GamePlugin<DiceFlushState, DiceFlushAction, typeof settings> = {
  id:"dice-flush", title:"Dice Flush", category:"dice",
  players:{min:1,max:1,multiplayer:false},
  description:"Roll 5 dice and keep the best — score points for matching faces. The more matches, the better!",
  howToPlay:`Dice Flush is a dice poker game. Each round you start with 5 rolled dice. Your goal is to get as many dice showing the same face as possible.

You have up to 2 rerolls. Click any dice to mark them as "kept" (they turn green). Then click Reroll to roll the non-kept dice again. After your rerolls, or whenever you are satisfied, click Score to lock in your round score.

Scoring: Five of a kind = 500 pts, Four of a kind = 200 pts, Three of a kind = 80 pts, Two pair = 30 pts, One pair = 10 pts, No matches = 0 pts.

Strategy: if your first roll gives you a pair or three of a kind, keep those dice and reroll the rest hoping to improve. Five of a kind is rare but spectacular! Use Settings to play 5 or 10 rounds. Final score is the sum of all round scores. Can you hit five of a kind?`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceFlushSettings),
  reducer, isTerminal,
  hint: (state: DiceFlushState): HintTarget | null => {
    if (state.phase === "gameover") return null;
    if (state.phase === "result") {
      return { selector: '[data-testid="hint-target-dice-flush-next"]', pulses: 3 };
    }
    if (state.rerolls < state.maxRerolls) {
      return { selector: '[data-testid="hint-target-dice-flush-roll"]', pulses: 3 };
    }
    return { selector: '[data-testid="hint-target-dice-flush-score"]', pulses: 3 };
  },
  component:DiceFlush,
};
