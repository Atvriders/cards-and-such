import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SkatState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const Skat = /* @__PURE__ */ lazy(() => import("./Skat.js").then((mod) => ({ default: mod.Skat as unknown as React.ComponentType<unknown> })));
export const skatSettings = {} as const;
type SkatSettings = SettingsOf<typeof skatSettings>;
type SkatAction =
  | { type: "bid"; bid: number }
  | { type: "pickup"; take: boolean }
  | { type: "discard"; cardId: string }
  | { type: "setTrump"; trump: import("./state.js").SkatTrump }
  | { type: "play"; cardId: string };

export const skatPlugin: GamePlugin<SkatState, SkatAction, typeof skatSettings> = {
  id: "skat",
  title: "Skat",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Classic German 3-player trick-taking game. Bid to become declarer, pick trump, and score 61+ points.",
  howToPlay: `Skat is Germany's national card game, played with a 32-card deck (7 through Ace in four suits). Three players receive 10 cards each; 2 cards form the "Skat" pile.

**Bidding:** Players bid game values. The highest bidder becomes the declarer and plays alone against the other two as a team. You can bid 18, 20, or 22 — or pass to let bots fight for it.

**The Skat:** As declarer, you may pick up the 2 Skat cards and discard 2 from your hand. Those discarded cards count toward your score at game end.

**Trump selection:** Choose a suit as trump (or "Grand" where only Jacks are trump). Jacks are always the four highest trumps in any suit game, ranked ♣ > ♠ > ♥ > ♦.

**Card values:** Ace=11, Ten=10, King=4, Queen=3, Jack=2, others=0. Total in deck: 120 points.

**Winning:** The declarer needs 61+ points (including Skat). The non-declarers win if they hold the declarer to 60 or fewer. Follow suit strictly; trump beats all other suits.

**Strategy:** As declarer, draw out trumps early. As defender, cooperate with your partner to block high-value cards.`,
  settings: skatSettings,
  initialState: (seed: number, _settings: SkatSettings) => initialState(seed),
  reducer,
  isTerminal,
  hint: (state: SkatState): HintTarget | null => {
    if (isTerminal(state)) return null;
    return { selector: '[data-testid="hint-target-skat-primary"]', pulses: 3 };
  },
  component: Skat,
};
