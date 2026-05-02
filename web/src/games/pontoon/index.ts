import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PontoonState, PontoonAction } from "./state.js";
import { initialState, reducer, isTerminal, handValue } from "./state.js";
import { PontoonGame } from "./Game.js";

export const pontoonSettings = {
  handsPerSession: {
    kind: "number" as const,
    label: "Hands per Session",
    min: 5,
    max: 50,
    step: 5,
    default: 20,
  },
  bet: {
    kind: "enum" as const,
    label: "Bet per Hand",
    options: ["5", "10", "25", "100"] as const,
    default: "10",
  },
} as const;

type Settings = SettingsOf<typeof pontoonSettings>;

export const pontoonPlugin: GamePlugin<PontoonState, PontoonAction, typeof pontoonSettings> = {
  id: "pontoon",
  title: "Pontoon",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "British Blackjack. Pontoon (A+10) pays 2:1. Five Card Trick is second-best hand.",
  howToPlay: `Pontoon is the British ancestor of Blackjack. The goal is to reach 21 (or as close as possible) without busting. The terminology and rules have important differences.

Terminology: Hit = Twist. Stand = Stick (only allowed at 15 or higher). Double = Buy. The dealer is called the Banker.

Special hands: A Pontoon — an Ace plus any ten-value card on the initial two cards — pays 2:1 and beats everything except another Pontoon. A Five Card Trick — any five-card hand totaling 21 or less — is the second-best hand and beats all totals under 21 (except a Pontoon). It pays 1:1.

Banker rules: The banker's cards are both face-down until settlement (you can't see the upcard). The banker draws to 17 and always wins ties, except against Pontoon.

Buy action: You may Buy (double your bet) before twisting. Once you Twist (hit), you cannot Buy again. You can Buy on more than just 2 cards, unlike standard Blackjack Double Down.

Strategy: Buy aggressively on soft hands and 9-11. Aim for a Five Card Trick when cards are low — five cards totaling 19 beats a banker's 20!`,
  settings: pontoonSettings,
  initialState: (seed: number, settings: Settings) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state) => {
    if (state.phase === "betting" || state.phase === "settled") {
      return { selector: '[data-testid="hint-target-pontoon-deal"]', pulses: 3 };
    }
    if (state.phase !== "player") return null;
    const total = handValue(state.playerHand.cards).best;
    if (total < 12) return { selector: '[data-testid="hint-target-pontoon-twist"]', pulses: 3 };
    if (total >= 17) return { selector: '[data-testid="hint-target-pontoon-stick"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-pontoon-twist"]', pulses: 3 };
  },
  component: PontoonGame,
};
