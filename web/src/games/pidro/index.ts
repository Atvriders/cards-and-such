import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PidroState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Pidro } from "./Pidro.js";

const pidroSettings = {
  botDifficulty: {
    kind: "enum" as const,
    label: "Bots",
    options: ["easy", "hard"] as const,
    default: "hard" as const,
  },
} as const;

type PidroSettingsType = SettingsOf<typeof pidroSettings>;
type PidroAction =
  | { type: "bid"; amount: number }
  | { type: "play"; cardId: string };

export const pidroPlugin: GamePlugin<PidroState, PidroAction, typeof pidroSettings> = {
  id: "pidro",
  title: "Pidro",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Canadian 4-player partnership trick-taking game with competitive bidding.",
  howToPlay: `Pidro is a popular Canadian trick-taking game played in teams of two (2 vs 2). You and Bot 2 form one team; Bot 1 and Bot 3 form the other. Seats are alternating, so partners sit across from each other.

Bidding: Each player bids the number of tricks their team will take (2–6), or passes. The highest bidder wins the auction and chooses trump based on their longest suit. If all pass, no game is played.

Play: The highest bidder leads first. Standard trick-taking rules apply — you must follow the led suit if possible. The highest trump wins; if no trump, the highest card of the led suit wins. Partners cooperate: if your partner is winning the trick, you may play low to save your high cards.

Scoring: Tricks are counted per team. If the bidding team makes their contract (wins at least the bid number of tricks), they score that number of points. If set, they lose those points. The opposing team scores their own tricks.

The goal is to accumulate more points than the opposing team over multiple rounds.

Click a bid number or Pass during the auction, then click cards to play. Legal moves are highlighted.`,
  settings: pidroSettings,
  initialState: (seed: number, settings: PidroSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: Pidro,
};
