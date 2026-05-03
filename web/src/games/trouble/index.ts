import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { TroubleState, TroubleAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Trouble } from "./Game.js";

export const troubleSettings = {
  opponents: {
    kind: "enum" as const,
    label: "Opponents",
    options: ["1", "2", "3"] as const,
    default: "1" as const,
  },
} as const;

type TroubleSettingsType = SettingsOf<typeof troubleSettings>;

export const troublePlugin: GamePlugin<TroubleState, TroubleAction, typeof troubleSettings> = {
  id: "trouble",
  title: "Trouble",
  category: "board",
  players: { min: 1, max: 4, multiplayer: false },
  description: "Pop the bubble, race your pawns. Land on foes to send them back!",
  howToPlay: `Trouble is a fast-paced racing game for 2-4 players. You play as blue; bots control the other colors. The goal is simple: move all four of your pawns from your home base, around the 28-square track, and into the finish position before anyone else.

On your turn, click "Pop!" to roll the Pop-O-Matic die. You must roll a 6 to bring any pawn out of home base onto square 0. Once a pawn is on the track, roll the die and click any moveable pawn to advance it by the rolled number.

Rolling a 6 gives you a bonus turn — you get to pop again right away. Take advantage of this to bring more pawns out or surge ahead. If no pawn can legally move with the rolled number, your turn passes automatically.

Landing your pawn on a square occupied by an opponent's pawn sends that pawn back to their home base — a great way to slow down the competition. Starting squares (0, 7, 14, 21) are safe and cannot be captured on.

The first player to get all four pawns to the finish wins! Bots automatically prioritize getting pawns out first, then advance the most behind pawn.`,
  settings: troubleSettings,
  initialState: (seed: number, settings: TroubleSettingsType) => initialState(seed, settings),
  reducer, isTerminal, hint: (state: TroubleState): HintTarget | null => (state.phase === "moving" ? { selector: ".move-btn", pulses: 3 } : null), component: Trouble,
};
