import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ScorpionState, ScorpionAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Scorpion } from "./Scorpion.js";

export const scorpionSettings = {} as const;

type ScorpionSettings = SettingsOf<typeof scorpionSettings>;

export const scorpionPlugin: GamePlugin<ScorpionState, ScorpionAction, typeof scorpionSettings> = {
  id: "scorpion",
  title: "Scorpion",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Build same-suit K→A sequences in the tableau. No foundation piles.",
  howToPlay: `Complete all four suits by building K-through-Ace sequences in the same suit directly on the tableau. There are no separate foundation piles — a completed sequence is automatically removed.

Deal: Seven columns of seven cards each. The first four columns have three face-down cards at the bottom; the last three columns are fully face-up. Three reserve cards sit off to the side.

Moves: Build tableau columns down in the same suit — a 6♠ plays only on a 7♠. Like Yukon, you may pick up any face-up card (and all cards resting on top of it) even if they don't form a proper sequence — only the bottom card of your group must legally land on the target. Face-down cards are automatically revealed when uncovered.

Reserve: Click "Deal Reserve" once to deal one card face-up to each of the first three columns.

Win: Four complete K-to-Ace same-suit sequences are removed automatically.

Scoring: +100 per completed suit sequence.

Tips: Expose face-down cards as quickly as possible. Empty columns are powerful — use them to reorganize suits. Try to build complete same-suit runs before dealing the reserve.`,
  settings: scorpionSettings,
  initialState: (seed: number, settings: ScorpionSettings) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: Scorpion,
};
