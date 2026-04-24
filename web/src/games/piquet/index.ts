import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PiquetState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Piquet } from "./Piquet.js";

const piquetSettings = {
  botDifficulty: {
    kind: "enum" as const,
    label: "Bots",
    options: ["easy", "hard"] as const,
    default: "hard" as const,
  },
} as const;

type PiquetSettingsType = SettingsOf<typeof piquetSettings>;

type PiquetAction =
  | { type: "discard"; cardIds: string[] }
  | { type: "play"; cardId: string };

export const piquetPlugin: GamePlugin<PiquetState, PiquetAction, typeof piquetSettings> = {
  id: "piquet",
  title: "Piquet",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Elegant French 2-player card game with declarations and trick-play on a 32-card deck.",
  howToPlay: `Piquet is one of the oldest and most respected card games in the world, a 2-player contest of skill that has been played in France since the 16th century.

The 32-card Piquet deck contains 7 through Ace in all four suits. Each player receives 12 cards, with 8 cards forming the talon (stock).

Exchange: Before play, you may discard up to 5 cards and draw replacements from the talon. The bot exchanges similarly. Good strategy here is crucial.

Declarations score before tricks begin:
- Point: the player with more cards in a single suit scores that count.
- Sequence: runs of 3+ cards in the same suit score their length (5+ earn a bonus).
- Sets: Three or four cards of the same rank (10 or above) score 3 or 14 points.

Tricks: There is no trump suit. The highest card of the led suit wins. You must follow suit. Each trick scores 1 point for its winner. Winning all 12 tricks (Capot) earns a 40-point bonus.

Select cards to discard, then click the Discard button. Then play tricks by clicking cards.`,
  settings: piquetSettings,
  initialState: (seed: number, settings: PiquetSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: Piquet,
};
