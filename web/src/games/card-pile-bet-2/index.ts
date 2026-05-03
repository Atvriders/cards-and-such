import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardPileBet2State, CardPileBet2Action, CardPileBet2Settings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const CardPileBet2Game = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.CardPileBet2Game as unknown as React.ComponentType<unknown> })));
const settings = { rounds: { kind:"enum" as const, label:"Rounds", options:["8","12"] as const, default:"8" as const } } as const;
type S = SettingsOf<typeof settings>;
export const cardPileBet2Plugin: GamePlugin<CardPileBet2State, CardPileBet2Action, typeof settings> = {
  id:"card-pile-bet-2", title:"Card Pile Bet 2", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Bet on higher or lower cards in the pile. Compact 60-coin session.",
  howToPlay:`Card Pile Bet 2 is a compact higher-or-lower card game. Starting with 60 coins, you bet on whether each new card drawn from the pile ranks higher or lower than the previous one. Card ranks go from 2 to Ace, with suits ignored. Win your bet for a correct call; lose it for a wrong guess; ties push. Choose 8 or 12 rounds. Your goal is to grow those 60 starting coins as far as possible before the rounds end.`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CardPileBet2Settings),
  reducer,isTerminal,hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-card-pile-bet-2-primary"]', pulses: 3 }), component:CardPileBet2Game,
};
