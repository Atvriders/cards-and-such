import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { ParcheesiState, ParcheesiAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Parcheesi } from "./Game.js";

export const parcheesiSettings = {
  opponents: {
    kind: "enum" as const,
    label: "Opponents",
    options: ["1", "2", "3"] as const,
    default: "1" as const,
  },
} as const;

type ParcheesiSettingsType = SettingsOf<typeof parcheesiSettings>;

export const parcheesiPlugin: GamePlugin<ParcheesiState, ParcheesiAction, typeof parcheesiSettings> = {
  id: "parcheesi",
  title: "Parcheesi",
  category: "board",
  players: { min: 1, max: 4, multiplayer: false },
  description: "Classic Indian cross-and-circle race. Roll dice, move pawns, send opponents home.",
  howToPlay: `Parcheesi is a classic Indian-origin race game for 2-4 players. You control four blue pawns; bots control the remaining colors (red, green, orange). The goal is to be the first to move all four of your pawns from the starting yard all the way around the 52-square track and into home (marked H).

At the start of each turn, click "Roll Dice" to roll two dice. You may then use each die value separately — each die moves one pawn forward by that exact number of spaces. A die showing 5 is required to bring a pawn out of the yard onto square 0.

If your pawn lands on an opponent's pawn on a non-safe square, that opponent's pawn is sent back to the yard. Safe squares (0, 8, 13, 21, 26, 34, 39, 47) cannot be captured on. A pawn that advances to position 52 reaches home and stays there.

Bots play automatically after your turn, always choosing to advance the pawn that is furthest along the track. If neither die can legally move any pawn, the turn passes automatically.

Win by getting all four pawns home before any opponent does!`,
  settings: parcheesiSettings,
  initialState: (seed: number, settings: ParcheesiSettingsType) => initialState(seed, settings),
  reducer, isTerminal, hint: (state: ParcheesiState): HintTarget | null => (state.phase === "rolling" ? { selector: ".roll-btn", pulses: 3 } : null), component: Parcheesi,
};
