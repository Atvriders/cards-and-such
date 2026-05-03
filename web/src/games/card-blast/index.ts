import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardBlastState, CardBlastAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CardBlast } from "./CardBlast.js";

export const cardBlastSettings = {
  rounds: {
    kind: "enum" as const,
    label: "Rounds",
    options: ["5", "8", "12"] as const,
    default: "8" as const,
  },
} as const;

type CardBlastSettingsType = SettingsOf<typeof cardBlastSettings>;

export const cardBlastPlugin: GamePlugin<CardBlastState, CardBlastAction, typeof cardBlastSettings> = {
  id: "card-blast",
  title: "Card Blast",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Select and blast card combos from your hand to score as many points as possible.",
  howToPlay: `Card Blast is a fast-paced card combo game. You hold a hand of seven playing cards. Each round, select up to five cards and either Blast them for points or Discard them to swap in fresh cards.

When you Blast, the game evaluates your selected cards for the best combo it can find. Five of a kind or flush blast scores 500. Four of a kind scores 400. Full house (3+2 matching ranks) scores 350. A plain flush (all same suit) scores 300. Three of a kind scores 200. Two pair scores 150. A single pair scores 60. A suit blast of 3+ cards of the same suit scores 40 per card. High-card blasts score the average rank value.

After blasting or discarding, the selected cards are removed from your hand and replaced with freshly dealt cards. The round counter advances and the game continues until all rounds are used.

Scoring: your final game score equals your total blast points divided by 5, capped at 1000. A strong 8-round game blasting pairs and flushes consistently can reach 300–500 points. Perfect combos like four-of-a-kind and flushes will push you toward the cap.

Tips: don't discard too often — each discard wastes a round. Save five-card hands for big flushes. Two pair in your hand is better than a single pair so hold both pairs before blasting. Aces and face cards carry high rank values for high-card blasts.`,
  settings: cardBlastSettings,
  initialState: (seed: number, settings: CardBlastSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: CardBlastState): HintTarget | null => {
    if (isTerminal(state)) return null;
    return { selector: '[data-testid="hint-target-card-blast-primary"]', pulses: 3 };
  },
  component: CardBlast,
};
