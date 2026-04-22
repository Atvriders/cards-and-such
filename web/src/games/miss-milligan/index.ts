import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { MissMilliganState, MissMilliganAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MissMilligan } from "./MissMilligan.js";

export const missMilliganSettings = {} as const;

export const missMilliganPlugin: GamePlugin<MissMilliganState, MissMilliganAction, typeof missMilliganSettings> = {
  id: "miss-milligan",
  title: "Miss Milligan",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Classic patience: deal 8 at a time and build foundations up from Aces.",
  howToPlay: `Miss Milligan is a classic British patience game played with a single deck. The goal is to build all four foundations from Ace up to King in suit.

Deal: Eight columns each start with one face-up card. The remaining 44 cards form the stock.

Dealing: Click the stock to deal one card face-up to each of the eight columns simultaneously. You can only deal when there are at least 8 cards left in stock.

Tableau: Columns build downward in alternating colors — place a red card on a black card one rank higher. You may move valid descending alternating-color sequences as a group. Empty columns accept any single card or sequence.

Foundations: Build each of the four suits up from Ace through King. Move Aces (and follow-up cards) to foundations as soon as they appear.

Waiving Rule: When a column is completely empty, you gain extra flexibility — the top card of any other column (or a valid sequence) can be moved there, even if you'd normally be blocked. Use empty columns wisely as temporary buffers.

Scoring: +10 per card moved to a foundation. Use Auto-move when you're confident.

Tips: Try to expose low-rank cards early. Empty columns are valuable — don't fill them carelessly.`,
  settings: missMilliganSettings,
  initialState: (seed: number) => initialState(seed, {}),
  reducer,
  isTerminal,
  component: MissMilligan,
};
