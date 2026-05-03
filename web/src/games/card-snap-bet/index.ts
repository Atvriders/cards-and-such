import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardSnapBetState, CardSnapBetAction, CardSnapBetSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const CardSnapBetGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.CardSnapBetGame as unknown as React.ComponentType<unknown> })));
const settings = { rounds: { kind:"enum" as const, label:"Rounds", options:["8","12"] as const, default:"8" as const } } as const;
type S = SettingsOf<typeof settings>;
export const cardSnapBetPlugin: GamePlugin<CardSnapBetState, CardSnapBetAction, typeof settings> = {
  id:"card-snap-bet", title:"Card Snap Bet", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Quick snap higher-or-lower betting game with 90 starting coins.",
  howToPlay:`Card Snap Bet is a quick-fire higher-or-lower prediction card game. You start with 90 coins, see the top card, choose a wager, and snap a prediction: higher or lower. A correct call wins your bet; a wrong snap loses it; equal ranks push. Card ranks run 2 through Ace. Suits do not matter. Press Next after each reveal. Choose 8 or 12 rounds for a brisk session. Your final coin total is your score — how many coins can you snap up?`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CardSnapBetSettings),
  reducer,isTerminal,hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-card-snap-bet-primary"]', pulses: 3 }), component:CardSnapBetGame,
};
