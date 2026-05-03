import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardShuffleProState, CardShuffleProAction, CardShuffleProSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CardShuffleProGame } from "./Game.js";

export const cardShuffleProSettings = {
  difficulty: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "normal"] as const,
    default: "normal" as const,
  },
} as const;

type CSPSettingsType = SettingsOf<typeof cardShuffleProSettings>;

function coerce(s: CSPSettingsType): CardShuffleProSettings {
  return { difficulty: s.difficulty };
}

export const cardShuffleProPlugin: GamePlugin<
  CardShuffleProState,
  CardShuffleProAction,
  typeof cardShuffleProSettings
> = {
  id: "card-shuffle-pro",
  title: "Card Shuffle Pro",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description:
    "Pure shuffle simulator. Each round we shuffle a fresh 52-card deck and deal 5 face-up cards. Predict the color (red or black) of the next card. 12 rounds.",
  howToPlay:
    "Card Shuffle Pro is a tiny color-prediction trainer based on a fresh Fisher-Yates shuffle each round.\n\nEach round you see five cards from the top of a freshly shuffled standard 52-card deck. The sixth card is hidden. Predict whether it is red (hearts/diamonds) or black (spades/clubs). Use the visible cards to estimate which color is more likely to remain in the deck.\n\nYou play 12 rounds; each correct guess is +1 point. Maximum score is 12.",
  settings: cardShuffleProSettings,
  initialState: (seed: number, s: CSPSettingsType) => initialState(seed, coerce(s)),
  reducer,
  isTerminal,
  hint: (state: any) => {
    if (state.revealed) return { selector: '[data-testid="hint-target-card-shuffle-pro-next"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-card-shuffle-pro-red"]', pulses: 3 };
  },
  component: CardShuffleProGame,
};
