import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { LowestCardBetState, LowestCardBetAction, LowestCardBetSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const LowestCardBet = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.LowestCardBet as unknown as React.ComponentType<unknown> })));
const settings = { rounds: { kind:"enum" as const, label:"Rounds", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const lowestCardBetPlugin: GamePlugin<LowestCardBetState, LowestCardBetAction, typeof settings> = {
  id:"lowest-card-bet", title:"Lowest Card Bet", category:"cards",
  players:{min:1,max:1,multiplayer:false},
  description:"See a card and bet chips that the next will be lower! The flip side of Highest Card Bet.",
  howToPlay:`Lowest Card Bet is a gambling card game — the opposite of Highest Card Bet. Each round you see one card and decide whether to bet chips that the next card drawn will be lower in value.

Cards are valued 2 through Ace (Ace is highest at 14). You start with 100 chips. Bet 5, 10, 20, 50, or go all-in. If the next card is lower, you win that bet amount. If higher, you lose it. Ties result in no change.

Strategy: a high card (King, Ace) on the table means the next card is likely lower — good time to bet big. A low card (2, 3) means danger — bet cautiously. The challenge is reading the odds with imperfect information.

The game lasts 10 or 20 rounds (set in Settings). Final score is your chip total. Start with 100, finish higher for a profit. Can you exploit the probabilities and walk away a winner?`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as LowestCardBetSettings),
  reducer, isTerminal, hint: (state: LowestCardBetState): HintTarget | null => ((state.phase === "betting" || state.phase === "reveal" || state.phase === "result") ? { selector: ".bet-btn", pulses: 3 } : null), component:LowestCardBet,
};
