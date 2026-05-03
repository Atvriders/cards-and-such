import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { KachuufiState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const Game = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.Game as unknown as React.ComponentType<unknown> })));
import type { Suit } from "../../engines/deck/index.js";

export const kachuufiSettings = {} as const;
type KachuufiSettings = SettingsOf<typeof kachuufiSettings>;
type KachuufiAction =
  | { type: "bid"; tricks: number; trump: Suit }
  | { type: "play"; cardId: string };

export const kachuufiPlugin: GamePlugin<KachuufiState, KachuufiAction, typeof kachuufiSettings> = {
  id: "kachuufi",
  title: "Kachuufi",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Pakistani trick-taking card game with bidding. Name your trump and meet your target!",
  howToPlay: `Kachuufi is a popular Pakistani trick-taking card game enjoyed across the country. It is played with a standard 52-card deck and involves bidding on tricks before play begins.

Setup: A 52-card deck is dealt — 13 cards to each player. Cards rank Ace (highest) down to 2 (lowest).

Bidding: Before play, you declare how many tricks (out of 13) you commit to winning, and name the trump suit. Your declared bid becomes your contract.

Playing tricks: The player who bid leads the first trick. On each trick, you each play one card. You must follow the led suit if you have it. If not, you may play any card including trump.

Winning a trick: Trump beats non-trump. Among same-suit cards, the highest rank wins. If neither player follows the led suit or plays trump, the leader wins.

Scoring: Making your bid exactly or better earns positive points equal to your bid. Failing your bid results in negative points equal to the bid amount.

Strategy: Survey your hand before bidding — count your high cards (Ace, King, Queen) and trump length. Bid conservatively to guarantee making your contract. In play, lead with high trumps early to draw out your opponent's trump cards!`,
  settings: kachuufiSettings,
  initialState: (seed: number, _settings: KachuufiSettings) => initialState(seed),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver || (s as any).won || (s as any).isWon || (s as any).isComplete || (s as any).complete) return null; return { selector: '[data-testid="hint-target-kachuufi-action"]', pulses: 3 }; },
  component: Game,
};
