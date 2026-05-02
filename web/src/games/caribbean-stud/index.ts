import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CaribbeanStudState, CaribbeanStudAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { rankHand } from "../../engines/deck/ranking.js";
import { CaribbeanStud } from "./CaribbeanStud.js";

export const caribbeanStudSettings = {
  anteSize: {
    kind: "enum" as const,
    label: "Ante Size",
    options: ["10", "25", "50"] as const,
    default: "25",
  },
  hands: {
    kind: "enum" as const,
    label: "Hands per Session",
    options: ["5", "10", "20"] as const,
    default: "10",
  },
} as const;

type CaribbeanStudSettingsType = SettingsOf<typeof caribbeanStudSettings>;

export const caribbeanStudPlugin: GamePlugin<CaribbeanStudState, CaribbeanStudAction, typeof caribbeanStudSettings> = {
  id: "caribbean-stud",
  title: "Caribbean Stud Poker",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "5-card stud vs dealer. Fold or raise — hope dealer qualifies and you beat them.",
  howToPlay: `Caribbean Stud Poker pits your 5-card hand against the dealer's — no bluffing, just hand strength.

Each round: pay an ante bet, then receive 5 cards face-up. The dealer also gets 5 cards, with only one face-up. After seeing your hand and the dealer's upcard, decide: Fold (lose your ante) or Raise (add 2× the ante as your raise bet).

Dealer qualification: The dealer must hold at least Ace-King high to qualify. If the dealer doesn't qualify, your ante pays 1:1 and your raise is returned — even if your hand is worse!

If the dealer qualifies and you win, your ante pays 1:1 and your raise pays according to your hand:
• Pair: 1:1 | Two Pair: 2:1 | Three of a Kind: 3:1
• Straight: 4:1 | Flush: 5:1 | Full House: 7:1
• Four of a Kind: 20:1 | Straight Flush: 50:1 | Royal Flush: 100:1

If the dealer qualifies and beats you, both ante and raise are lost. Ties push.

Strategy tip: As a rule of thumb, raise whenever you have at least a pair, and also raise with Ace-King if your highest cards match or beat the dealer's upcard.

Settings: Ante size ($10/$25/$50), hands per session (5/10/20). Score equals final bankroll.`,
  settings: caribbeanStudSettings,
  initialState: (seed: number, settings: CaribbeanStudSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: CaribbeanStudState): HintTarget | null => {
    if (state.phase === "ante" || state.phase === "settled") {
      if (state.bankroll <= 0) return null;
      return { selector: '[data-testid="hint-target-caribbean-stud-deal"]', pulses: 3 };
    }
    if (state.phase !== "decision") return null;
    // House strategy: raise with any pair or better, or A-K with high kickers; fold otherwise.
    if (state.playerCards.length < 5) return null;
    const r = rankHand(state.playerCards);
    if (r.class !== "high-card") {
      return { selector: '[data-testid="hint-target-caribbean-stud-raise"]', pulses: 3 };
    }
    const ranks = state.playerCards.map((c) => (c.rank === 1 ? 14 : c.rank)).sort((a, b) => b - a);
    if (ranks[0] === 14 && ranks[1] === 13) {
      return { selector: '[data-testid="hint-target-caribbean-stud-raise"]', pulses: 3 };
    }
    return { selector: '[data-testid="hint-target-caribbean-stud-fold"]', pulses: 3 };
  },
  component: CaribbeanStud,
};
