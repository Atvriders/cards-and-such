import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type {
  AcquireFullState,
  AcquireFullAction,
  AcquireFullSettings,
} from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";

const AcquireFullGame = /* @__PURE__ */ lazy(() =>
  import("./Game.js").then((mod) => ({
    default: mod.AcquireFullGame as unknown as React.ComponentType<unknown>,
  })),
);

const settings = {
  _dummy: { kind: "boolean" as const, label: "placeholder", default: false },
} as const;

type S = SettingsOf<typeof settings>;

export const acquireFullPlugin: GamePlugin<AcquireFullState, AcquireFullAction, typeof settings> = {
  id: "acquire-full",
  title: "Acquire (Full)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description:
    "Sid Sackson's classic hotel-chain stock investment game vs 3 CPUs: form chains, ride mergers, win majority bonuses.",
  howToPlay: `Acquire (Full) puts you against three CPU opponents in Sid Sackson's 1962 stock-investment classic.

The board is a 12 × 9 grid of 108 tiles labeled A1–L9. Seven hotel chains (Worldwide, Sackson, Festival, Imperial, American, Continental, Tower) wait to be founded; each has 25 shares in the bank. You begin with $6,000 and 6 tiles in hand.

On your turn:
1. Play one tile from your hand. The tile is placed on the matching grid square.
   • Lone tile (no adjacency): just sits on the board.
   • Adjacent to one existing chain: that chain GROWS to include the tile and any touching loose tiles.
   • Adjacent to other loose tiles (no chain yet): a new chain is FOUNDED — pick which inactive chain to use. The founder gets 1 free share if the bank still has it.
   • Adjacent to two-or-more chains: a MERGER occurs. The largest chain survives; the others FOLD. Majority and minority bonuses are paid to the top shareholders of each folded chain (10× / 5× the current price). Then every holder of the folded chain may choose to sell (at pre-merger price), trade 2 folded shares for 1 survivor share, or keep their shares.
   • Illegal: a tile that would merge two ALREADY-SAFE (≥11 tile) chains is a "dead tile" — try a different one.
2. Buy up to 3 shares of any active (founded) chains, at the chain's current price. Bigger chains and higher-tier chains cost more (Worldwide/Sackson are tier-1; Festival/Imperial/American tier-2; Continental/Tower tier-3).
3. End your turn. You'll auto-draw replacement tiles to 6 at the start of your next turn.

Game end: any chain reaches 41 tiles, OR every active chain is "safe" (≥11 tiles). Final bonuses are paid on each active chain, then everyone cashes in their remaining shares at the current price. Highest cash total wins.

Score = max(0, your final cash − best CPU's cash + 5000 baseline). Winning adds a +5000 bonus.

Advanced rules omitted (this is the "L"-tier scaffold):
• Multi-chain merger order is auto-resolved smallest-first (in the official rules, the initiator picks).
• Tied majority/minority bonuses are split using floor division (no follow-up tie-breaker).
• Player-to-player trading outside mergers is not exposed.
• When a player has no legal tile play, our CPU simply discards a tile; the official "permanently unplayable → redraw" rule is simplified.
• You may revisit the merger dialog only once per folded chain (no partial sell-then-trade-then-sell flow).`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as AcquireFullSettings),
  reducer,
  isTerminal,
  hint: (s) => {
    if (isTerminal(s) !== null) return null;
    if (s.phase === "play-tile")      return { selector: '[data-testid="acquirefull-tile"]', pulses: 3 };
    if (s.phase === "choose-found")   return { selector: '[data-testid="acquirefull-found"]', pulses: 3 };
    if (s.phase === "merge-resolve")  return { selector: '[data-testid="acquirefull-merge-confirm"]', pulses: 3 };
    if (s.phase === "buy")            return { selector: '[data-testid="acquirefull-endbuy"]', pulses: 3 };
    if (s.phase === "cpu-turn")       return { selector: '[data-testid="acquirefull-cpustep"]', pulses: 3 };
    return null;
  },
  component: AcquireFullGame,
};
