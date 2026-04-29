import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { AbsState, AbsAction, AbsSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { AbsGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const punctLinePlugin: GamePlugin<AbsState, AbsAction, typeof settings> = {
  id: "punct-line",
  title: "Pünct (Line)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Line-formation Gipf-series abstract.",
  howToPlay: "Pünct is the fifth Project Gipf abstract by Kris Burm, focused on forming connected lines on a triangular board. In this 5x5 placement adaptation across 14 turns (7 each), you place pieces on a square grid; the CPU plays randomly. Click an empty cell. After 14 moves the higher count wins. Full Pünct uses triangular hex board with stackable pieces forming lines of three or more; the rich line-formation logic is reduced here to placement counting. Pünct won the 2005 award for innovative abstract design. Burm's whole Project Gipf series — Gipf, Tamsk, Zertz, Dvonn, Yinsh, Pünct — is regarded as the definitive modern abstract collection. Strategy: contest the centre fast; corners help in the endgame. Final scoreboard: 100 points for the win, 25 for a tie. The original board is hex-triangular but most digital adaptations reduce to grid for clarity.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as AbsSettings),
  reducer,
  isTerminal,
  component: AbsGame,
};
