import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ScorpionTailState, ScorpionTailAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ScorpionTail } from "./ScorpionTail.js";

export const scorpionTailSettings = {} as const;

type ScorpionTailSettings = SettingsOf<typeof scorpionTailSettings>;

export const scorpionTailPlugin: GamePlugin<ScorpionTailState, ScorpionTailAction, typeof scorpionTailSettings> = {
  id: "scorpion-tail",
  title: "Scorpion Tail",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "A wider Scorpion variant with 9 columns. Build K-to-A same-suit sequences in the tableau to remove them. Yukon-style pick-up; small reserve dealt at end.",
  howToPlay: `Scorpion Tail is a more spacious cousin of Scorpion, played across nine tableau columns instead of seven.

Goal: Complete all four suits by building King-through-Ace sequences in the same suit directly in the tableau. A completed K-to-A sequence is automatically removed. Win when all four suits are cleared.

Deal: Nine tableau columns receive cards face-up, with the first five columns having two face-down cards at the bottom. A tiny reserve of two cards sits off to the side.

Movement rules: Build tableau columns down in the same suit — a 6♣ may only be placed on a 7♣. Like Scorpion and Yukon, you may pick up any face-up card (and all cards on top of it) even if those cards don't form a proper sequence. Only the bottom card of your moving group must legally land on its target. An empty column accepts any card.

Face-down cards are revealed automatically when uncovered.

Reserve: Click "Deal Reserve" once to deal the two reserve cards face-up to the first two tableau columns.

Scoring: +100 per completed K-to-A suit sequence.

Tips: The extra columns (compared to Scorpion) give more room to separate cards by suit. Expose face-down cards quickly, and try to build at least one complete same-suit run before dealing the reserve.`,
  settings: scorpionTailSettings,
  initialState: (seed: number, settings: ScorpionTailSettings) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: ScorpionTail,
};
