import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SpeedState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Speed } from "./Speed.js";

export const speedSettings = {
  duration: {
    kind: "enum" as const,
    label: "Duration",
    options: ["60", "90", "120"] as const,
    default: "60" as const,
  },
} as const;

type SpeedAction =
  | { type: "play"; cardId: string; pileIndex: 0 | 1 }
  | { type: "tick" }
  | { type: "start" };

export const speedPlugin: GamePlugin<SpeedState, SpeedAction, typeof speedSettings> = {
  id: "speed",
  title: "Speed",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Time-trial card placement. Play cards ±1 from the pile top before the clock runs out.",
  howToPlay: `Race against the clock to play as many cards as possible onto two central piles.

Setup: you receive a 5-card hand. Two central piles are started with one card each. The remaining cards form your stock pile.

Gameplay: select a card from your hand by clicking it (it lifts up), then click either central pile to play it. A card is legal if its rank is exactly one higher or one lower than the current top of the pile — wrapping from Ace (1) to King (13) and back. For example, a 6 can be played on a 5 or 7; a King can be played on a Queen or an Ace. When you play a card, you immediately draw a replacement from your stock.

Scoring: your score equals the number of cards you successfully play before time runs out. Aim for a higher score each attempt.

Settings: choose 60, 90, or 120 seconds. Faster games reward quick pattern recognition; longer games reward endurance.

Tips: scan both piles for options before committing. A card playable on either pile should usually go to the pile with fewer options. Aces are versatile — they connect to both Kings and 2s.`,
  settings: speedSettings,
  initialState,
  reducer,
  isTerminal,
  component: Speed,
};
