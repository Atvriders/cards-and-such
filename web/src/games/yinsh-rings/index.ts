import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { AbsState, AbsAction, AbsSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { AbsGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const yinshRingsPlugin: GamePlugin<AbsState, AbsAction, typeof settings> = {
  id: "yinsh-rings",
  title: "YINSH (Rings)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Movable ring 5-in-a-row.",
  howToPlay: "YINSH is Kris Burm's Project Gipf abstract where rings move around the board, leaving markers behind. In this 5x5 placement adaptation across 14 turns (7 each), you and a random CPU place markers on intersections. The CPU plays randomly. Click an empty cell to place. After 14 moves whoever has more markers wins. The full YINSH game has rings that can move, flip, and form 5-in-a-row, but this simplification preserves the core placement mechanic. YINSH won the Mensa Select award in 2003; the original is widely considered one of the finest connection games ever published. The 5x5 reduction creates fast 30-second rounds. Tactically, claim corners and edges first; the centre tightens late. Final scoreboard: 100 points for the win, 25 for a tie. Rings movement is a future-version expansion. The abstract simplicity here lets you grasp YINSH's place-and-displace logic before tackling the full hex board.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as AbsSettings),
  reducer,
  isTerminal,
  component: AbsGame,
};
