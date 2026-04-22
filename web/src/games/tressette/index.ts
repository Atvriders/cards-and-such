import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TressetteState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Tressette } from "./Tressette.js";

export const tressetteSettings = {} as const;
type TressetteSettings = SettingsOf<typeof tressetteSettings>;
type TressetteAction = { type: "play"; cardId: string };

export const tressettePlugin: GamePlugin<TressetteState, TressetteAction, typeof tressetteSettings> = {
  id: "tressette",
  title: "Tressette",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Classic Italian 4-player partnership trick-taking game with no trump and a unique card ranking.",
  howToPlay: `Tressette is one of Italy's oldest card games, played in partnerships (you and the player opposite vs. the other two) with a 40-card deck using ranks A, 2–7, J, Q, K of four suits (no 8, 9, or 10).

**Unique Card Ranking (high → low):** 3, 2, Ace, King, Queen, Jack, 7, 6, 5, 4. Note that 3 and 2 outrank the Ace — a distinctive feature of Italian card games.

**No Trump:** There is no trump suit. The highest card of the led suit always wins the trick. You must follow suit if you can; otherwise play any card.

**Scoring:** Points are counted per team after all 10 tricks are played.
- Ace, 2, and 3 each score 1 point (12 total in the deck).
- Every 3 face cards (J, Q, K) held by a team score 1 bonus point (4.5 total, floored to 4).
- Winning the last trick earns a 1-point bonus.
- Total points per hand: ~11.

**Winning:** The team with the higher score wins the hand. A score of 6 or more beats the opposition.

**Strategy:** The 3 and 2 are your most powerful cards — hold them to capture tricks or use them to snatch high-value Aces from opponents.`,
  settings: tressetteSettings,
  initialState: (seed: number, _settings: TressetteSettings) => initialState(seed),
  reducer,
  isTerminal,
  component: Tressette,
};
