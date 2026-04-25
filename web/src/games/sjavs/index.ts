import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SjavsState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Sjavs } from "./Sjavs.js";

const sjavsSettings = {
  botDifficulty: {
    kind: "enum" as const,
    label: "Bots",
    options: ["easy", "hard"] as const,
    default: "hard" as const,
  },
} as const;

type SjavsSettingsType = SettingsOf<typeof sjavsSettings>;
type SjavsAction = { type: "play"; cardId: string };

export const sjavsPlugin: GamePlugin<SjavsState, SjavsAction, typeof sjavsSettings> = {
  id: "sjavs",
  title: "Sjavs",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Faroese 4-player partnership trick-taking game with clubs always as trump.",
  howToPlay: `Sjavs is the national card game of the Faroe Islands, a North Atlantic archipelago between Norway and Iceland. It is a partnership trick-taking game played 4-player in teams of two.

Teams: You and Bot 2 form Team 0; Bot 1 and Bot 3 form Team 1. Partners sit opposite each other in alternating seats.

Trump: In Sjavs, clubs (♣) are always the permanent trump suit — no auction or trump selection is needed. This fixed trump structure is the defining feature of the game.

Play: You lead the first trick. Players must follow the led suit if possible. If unable to follow suit, they must play clubs (trump) if they have any. If they cannot do either, they may play any card. Highest club wins; if no clubs are played, highest card of the led suit wins.

Scoring: The team with more tricks at the end wins the round. Play multiple rounds to accumulate score.

Partnership Communication: Play low when your partner is winning a trick to save your strong cards. Lead through opponents' weak suits to establish winners.

Strategy: Clubs are always trump — count your club holding carefully before leading or committing them. Use your highest non-club cards to establish tricks in other suits.

Click cards to play. Legal moves are highlighted.`,
  settings: sjavsSettings,
  initialState: (seed: number, settings: SjavsSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: Sjavs,
};
