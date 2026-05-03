import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { HighestCardBetState, HighestCardBetAction, HighestCardBetSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const HighestCardBet = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.HighestCardBet as unknown as React.ComponentType<unknown> })));
const settings = { rounds: { kind:"enum" as const, label:"Rounds", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const highestCardBetPlugin: GamePlugin<HighestCardBetState, HighestCardBetAction, typeof settings> = {
  id:"highest-card-bet", title:"Highest Card Bet", category:"cards",
  players:{min:1,max:1,multiplayer:false},
  description:"See one card, bet chips that the next card will be higher! Manage your bankroll wisely.",
  howToPlay:`Highest Card Bet is a simple gambling card game. Each round you are shown one card and must decide whether to bet that the next drawn card will be higher in value.

Cards are valued 2 through Ace (highest). You start with 100 chips. Each round, choose how much to bet: 5, 10, 20, 50, or all-in. If the next card is higher, you win that amount. If it is lower, you lose it. Equal values result in a tie with no gain or loss.

Strategy matters: if the current card is a 2, betting big makes sense since almost any card will be higher. If you see a King or Ace, the next card is likely lower — so bet small or hold back.

The game runs for 10 or 20 rounds (configurable in Settings). Your final score is your chip total. Starting with 100 and finishing above is a win. The key is managing your bets wisely — one big loss can be devastating. Good luck!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as HighestCardBetSettings),
  reducer, isTerminal, hint: (state: HighestCardBetState): HintTarget | null => ((state.phase === "betting" || state.phase === "reveal" || state.phase === "result") ? { selector: ".bet-btn", pulses: 3 } : null), component:HighestCardBet,
};
