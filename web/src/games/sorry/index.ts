import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { SorryState, SorryAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Sorry } from "./Game.js";

export const sorrySettings = {
  opponents: {
    kind: "enum" as const,
    label: "Opponents",
    options: ["1", "2", "3"] as const,
    default: "1" as const,
  },
} as const;

type SorrySettingsType = SettingsOf<typeof sorrySettings>;

export const sorryPlugin: GamePlugin<SorryState, SorryAction, typeof sorrySettings> = {
  id: "sorry",
  title: "Sorry!",
  category: "board",
  players: { min: 1, max: 4, multiplayer: false },
  description: "Draw cards to race your pawns home. Send opponents back with Sorry!",
  howToPlay: `Sorry! is a classic card-based racing game for 2-4 players. You play as blue; bots control the other colors. The goal is to be the first to move all four of your pawns from the yard, around the 45-square track, and safely home.

On your turn, click "Draw Card" to reveal the top card. Most cards move a pawn forward that many spaces. Special rules apply: Card 1 lets you bring a pawn out of the yard OR move 1 space. Card 2 moves 2 spaces and earns you another draw. Card 4 moves back 4 spaces. Card 10 moves 10 forward or 1 backward. Card 11 moves 11 forward.

The Sorry! card lets you send any one opponent pawn back to their yard — powerful for setting back the leader. The Swap card lets you exchange your pawn's position with an opponent's pawn on the board — useful to leap far ahead.

Landing on an opponent pawn on a non-safe square sends it back to the yard. Safe squares (0, 12, 24, 36) cannot be captured on. If you cannot play any card legally, your turn passes.

Bots play automatically using a greedy strategy: they always try to advance their pawn closest to home.`,
  settings: sorrySettings,
  initialState: (seed: number, settings: SorrySettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: Sorry,
};
