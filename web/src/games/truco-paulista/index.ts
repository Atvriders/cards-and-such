import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TrucoPaulistaState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const Game = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.Game as unknown as React.ComponentType<unknown> })));
export const trucoPaulistaSettings = {} as const;
type TrucoPaulistaSettings = SettingsOf<typeof trucoPaulistaSettings>;
type TrucoPaulistaAction = { type: "play"; cardId: string };

export const trucoPaulistaPlugin: GamePlugin<TrucoPaulistaState, TrucoPaulistaAction, typeof trucoPaulistaSettings> = {
  id: "truco-paulista",
  title: "Truco Paulista",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Brazilian Truco variant with Manilha cards. 4s are the supreme wild cards!",
  howToPlay: `Truco Paulista is the dominant card game of São Paulo, Brazil, played with a 40-card Spanish deck. It differs from Argentinian Truco through its "Manilha" system — a rotating set of four all-powerful cards.

Setup: Each player gets 3 cards. In this simplified version, the Manilha rank is fixed as 4, the strongest cards in the deck.

Manilha order (highest to lowest): 4 of Clubs ♣, 4 of Hearts ♥, 4 of Spades ♠, 4 of Diamonds ♦. Even the lowest Manilha (4♦) beats any non-Manilha card!

Card ranking below Manilha (highest to lowest): Ace, 7, 3, 2, King, Jack, Queen, 6, 5.

Playing: Click any card to play it against the bot. The bot plays simultaneously. The higher-ranked card wins the trick.

Scoring: Win 2 of 3 tricks to win the hand and earn 1 point. Tied tricks count as shared. Win the hand to score.

Strategy: If you hold a Manilha — especially ♣4 or ♥4 — you have a significant advantage. Use non-Manilha cards to probe the bot, then deploy your Manilha to clinch critical tricks!`,
  settings: trucoPaulistaSettings,
  initialState: (seed: number, _settings: TrucoPaulistaSettings) => initialState(seed),
  reducer,
  isTerminal,
  hint: (state: any) => {
      if (state.phase === "player-turn") return { selector: '[data-testid="hint-target-truco-paulista-hand"]', pulses: 3 };
      return null;
    },
  component: Game,
};
