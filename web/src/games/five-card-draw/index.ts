import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { FiveCardDrawState, DrawAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { rankHand, type HandClass } from "../../engines/deck/ranking.js";
import { FiveCardDraw } from "./FiveCardDraw.js";

const FCD_CLASS_ORDER: HandClass[] = [
  "high-card", "one-pair", "two-pair", "three-of-a-kind",
  "straight", "flush", "full-house", "four-of-a-kind", "straight-flush",
];

function fiveCardDrawHint(state: FiveCardDrawState): HintTarget | null {
  if (state.phase === "showdown" || state.phase === "waiting") {
    if (state.bankroll <= 0 || state.botBankroll <= 0) return null;
    return { selector: '[data-testid="hint-target-five-card-draw-deal"]', pulses: 3 };
  }
  if (state.phase === "draw") {
    // Pulse the Draw button — selecting cards is up to the player, but the button
    // applies whether or not they've selected anything.
    return { selector: '[data-testid="hint-target-five-card-draw-draw"]', pulses: 3 };
  }
  if (!state.playerTurn) return null;
  const toCall = state.botBet - state.playerBet;
  const strength = state.playerHand.length === 5
    ? FCD_CLASS_ORDER.indexOf(rankHand(state.playerHand).class)
    : -1;
  if (toCall === 0) {
    return { selector: '[data-testid="hint-target-five-card-draw-check"]', pulses: 3 };
  }
  const equity = strength >= 0 ? (strength + 1) / 9 : 0.15;
  const odds = toCall / (state.pot + toCall);
  if (equity > odds) {
    return { selector: '[data-testid="hint-target-five-card-draw-call"]', pulses: 3 };
  }
  return { selector: '[data-testid="hint-target-five-card-draw-fold"]', pulses: 3 };
}

export const fiveCardDrawSettings = {
  startingBankroll: {
    kind: "enum" as const,
    label: "Starting Bankroll",
    options: ["500", "1000", "5000"] as const,
    default: "1000",
  },
  anteSize: {
    kind: "enum" as const,
    label: "Ante Size",
    options: ["10", "25", "50"] as const,
    default: "25",
  },
} as const;

type FiveCardDrawSettingsType = SettingsOf<typeof fiveCardDrawSettings>;

export const fiveCardDrawPlugin: GamePlugin<FiveCardDrawState, DrawAction, typeof fiveCardDrawSettings> = {
  id: "five-card-draw",
  title: "5-Card Draw",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Classic 5-Card Draw vs a bot. Draw up to 5 cards to improve your hand.",
  howToPlay: `5-Card Draw is one of the simplest and most classic poker variants. Both players are dealt 5 private cards and then have the opportunity to discard and replace cards to improve their hand.

Each hand: both players post an ante. You receive 5 cards face-down. A betting round follows — you can Check, Bet, Raise, Call, or Fold.

Then comes the Draw: select any cards you want to discard (tap/click to select), then confirm your draw. You'll receive replacement cards for each discarded card. The bot also draws based on its hand strength — discarding to improve pairs, trips, or going for straights and flushes.

After the draw, a second betting round takes place. Then both hands are revealed and compared — the best 5-card hand wins the pot.

Strategy: Keep pairs, trips, and strong draws. Discard 3 cards to a pair, 2 to trips (fishing for a full house or four-of-a-kind), or 1-2 cards when chasing a straight or flush. Don't be afraid to stand pat with a strong made hand.

Hand rankings: Straight Flush, Four of a Kind, Full House, Flush, Straight, Three of a Kind, Two Pair, One Pair, High Card.

The game ends when one player runs out of chips. Settings: Starting Bankroll ($500/$1000/$5000), Ante Size ($10/$25/$50).`,
  settings: fiveCardDrawSettings,
  initialState: (seed: number, settings: FiveCardDrawSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: fiveCardDrawHint,
  component: FiveCardDraw,
  themeOverrides: {
    feltGradient: "linear-gradient(135deg, #0b3d2e, #1a6c3f)",
    accent: "rgba(74, 222, 128, 0.50)",
  },
};
