import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { AbsState, AbsAction, AbsSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { AbsGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const banqiDarkPlugin: GamePlugin<AbsState, AbsAction, typeof settings> = {
  id: "banqi-dark",
  title: "Banqi (Dark Chess)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Half-open Xiangqi variant on 4x8 grid.",
  howToPlay: "Banqi (Dark Chess) is a Xiangqi variant where pieces are placed face-down at random and revealed on first move. In this 5x5 placement adaptation across 14 turns (7 each), you place pieces on the grid; the CPU plays randomly. Click an empty cell. After 14 moves the higher count wins. Full Banqi uses 32 Xiangqi pieces on a 4x8 board, all face-down at start. Each turn a player either flips a face-down piece (revealing its identity) or moves a face-up piece. The face-down element introduces strategic uncertainty absent from regular Xiangqi. Banqi is hugely popular in Taiwan and Hong Kong as a casual cafe game. The Cantonese name 'Anqi' (dark chess) reflects the hidden-information component. Strategy in this placement version: contest the centre. Final scoreboard: 100 points for the win, 25 for a tie. Real Banqi rounds last 5-10 minutes; this version provides quick placement matches.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as AbsSettings),
  reducer,
  isTerminal,
  component: AbsGame,
};
