import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardDeckBetState, CardDeckBetAction, CardDeckBetSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const CardDeckBetGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.CardDeckBetGame as unknown as React.ComponentType<unknown> })));
const settings = { rounds: { kind:"enum" as const, label:"Rounds", options:["8","12"] as const, default:"8" as const } } as const;
type S = SettingsOf<typeof settings>;
export const cardDeckBetPlugin: GamePlugin<CardDeckBetState, CardDeckBetAction, typeof settings> = {
  id:"card-deck-bet", title:"Card Deck Bet", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Simple higher-or-lower card betting. Start with 75 coins over a fresh shuffled deck.",
  howToPlay:`Card Deck Bet is a simple higher-or-lower prediction game. A full deck is shuffled and dealt one card at a time. You see the top card, set your bet, and predict whether the next card will be higher or lower in rank. A correct prediction wins your bet; a wrong guess loses it. Ties return no coins. Ranks run from 2 (lowest) to Ace (highest). Start with 75 coins and choose 8 or 12 rounds. Your final coin total is your score.`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CardDeckBetSettings),
  reducer,isTerminal,hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-card-deck-bet-primary"]', pulses: 3 }), component:CardDeckBetGame,
};
