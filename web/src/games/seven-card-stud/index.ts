import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SevenCardStudState, StudAction } from "./state.js";
import { initialState, reducer, isTerminal, bestFiveOf } from "./state.js";
import { rankHand, type HandClass } from "../../engines/deck/ranking.js";
import { SevenCardStud } from "./SevenCardStud.js";

const STUD_CLASS_ORDER: HandClass[] = [
  "high-card", "one-pair", "two-pair", "three-of-a-kind",
  "straight", "flush", "full-house", "four-of-a-kind", "straight-flush",
];

function studHint(state: SevenCardStudState): HintTarget | null {
  if (state.phase !== "betting") {
    if (state.player.bankroll <= 0 || state.bot.bankroll <= 0) return null;
    return { selector: '[data-testid="hint-target-seven-card-stud-deal"]', pulses: 3 };
  }
  if (!state.playerTurn) return null;
  const toCall = state.player.bet < state.bot.bet ? state.bot.bet - state.player.bet : 0;
  let strength = -1;
  if (state.player.cards.length >= 5) {
    strength = STUD_CLASS_ORDER.indexOf(rankHand(bestFiveOf(state.player.cards)).class);
  } else {
    // Early streets: count pairs in 3-4 cards.
    const ranks = state.player.cards.map((c) => c.rank);
    const counts = new Map<number, number>();
    for (const r of ranks) counts.set(r, (counts.get(r) ?? 0) + 1);
    const maxCount = Math.max(0, ...counts.values());
    strength = maxCount >= 3 ? 3 : maxCount === 2 ? 1 : 0;
  }
  if (toCall === 0) {
    return { selector: '[data-testid="hint-target-seven-card-stud-check"]', pulses: 3 };
  }
  const equity = (strength + 1) / 9;
  const odds = toCall / (state.pot + toCall);
  if (equity > odds) {
    return { selector: '[data-testid="hint-target-seven-card-stud-call"]', pulses: 3 };
  }
  return { selector: '[data-testid="hint-target-seven-card-stud-fold"]', pulses: 3 };
}

export const sevenCardStudSettings = {
  startingBankroll: {
    kind: "enum" as const,
    label: "Starting Bankroll",
    options: ["500", "1000", "5000"] as const,
    default: "1000",
  },
  anteSize: {
    kind: "enum" as const,
    label: "Ante Size",
    options: ["5", "10", "25"] as const,
    default: "10",
  },
} as const;

type SevenCardStudSettingsType = SettingsOf<typeof sevenCardStudSettings>;

export const sevenCardStudPlugin: GamePlugin<SevenCardStudState, StudAction, typeof sevenCardStudSettings> = {
  id: "seven-card-stud",
  title: "7-Card Stud",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Classic 7-Card Stud vs a bot. No community cards — 7 cards dealt per player across 5 streets.",
  howToPlay: `7-Card Stud is a classic poker game with no community cards. Each player receives up to 7 personal cards and must make the best 5-card hand.

Each hand starts with both players posting an ante. On 3rd Street, each player receives 2 cards face-down (hole cards) and 1 card face-up. The player with the lowest face-up card acts first (brings in). Then betting proceeds.

On 4th, 5th, and 6th Streets, one more card is dealt face-up to each player with a betting round after each. On 7th Street (the final card), one card is dealt face-down. After the last betting round, remaining players reveal their hands — the best 5-card hand from their 7 cards wins the pot.

Betting is fixed-limit: streets 3 and 4 use the small bet (1× ante), streets 5, 6, and 7 use the big bet (2× ante). On each betting round you can: Check (if no bet yet), Bet, Call, Raise, or Fold.

You can see your opponent's face-up cards — use this information to gauge their hand strength. The bot evaluates hand strength progressively as cards are revealed.

The game continues until one player runs out of chips. Settings: Starting Bankroll ($500/$1000/$5000), Ante Size ($5/$10/$25).`,
  settings: sevenCardStudSettings,
  initialState: (seed: number, settings: SevenCardStudSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: studHint,
  component: SevenCardStud,
  themeOverrides: {
    feltGradient: "linear-gradient(135deg, #0b3d2e, #1a6c3f)",
    accent: "rgba(74, 222, 128, 0.50)",
  },
};
