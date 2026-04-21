import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { LaBelleLucieState, LaBelleLucieAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { LaBelleLucie } from "./LaBelleLucie.js";

export const laBelleLucieSettings = {
  redeals: {
    kind: "enum" as const,
    label: "Redeals",
    options: ["0", "1", "2", "3"] as const,
    default: "2",
  },
} as const;

type LaBelleLucieSettings = SettingsOf<typeof laBelleLucieSettings>;

export const laBelleLuciePlugin: GamePlugin<LaBelleLucieState, LaBelleLucieAction, typeof laBelleLucieSettings> = {
  id: "la-belle-lucie",
  title: "La Belle Lucie",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Seventeen three-card fans. Build same-suit sequences to the foundations.",
  howToPlay: `Move all 52 cards to the four foundations — one pile per suit, built up from Ace to King.

Deal: All 52 cards are laid out in 18 fan piles: 17 fans of three cards each, plus one fan with a single card. All cards are face-up. The four foundations sit above.

Moves: Only the top card of each fan may be moved. On fans, build down in the same suit — a 5♦ plays only on a 6♦. You cannot move cards to empty fan spaces. Drag cards or click them to auto-move to the best legal destination.

Redeals: When stuck, click Redeal to gather all remaining tableau cards, shuffle them, and re-deal into fresh fans. You get up to 2 redeals by default (configurable in settings). Use them wisely — the game becomes very difficult without them.

Scoring: +10 per card moved to a foundation.

Tips: The most important skill is sequencing same-suit cards: if you can expose an Ace or a card the foundations need, prioritize it. Keep an eye on deeply buried cards that block progress — save redeals for when you're truly stuck, not just temporarily slowed.`,
  settings: laBelleLucieSettings,
  initialState: (seed: number, settings: LaBelleLucieSettings) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: LaBelleLucie,
};
