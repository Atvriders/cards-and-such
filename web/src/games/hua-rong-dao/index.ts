import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { HuaRongDaoState, HuaRongDaoAction, HuaRongDaoSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { HuaRongDaoGame } from "./Game.js";

const settings = {
  puzzles: { kind: "enum" as const, label: "Puzzles", options: ["8"] as const, default: "8" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const huaRongDaoPlugin: GamePlugin<HuaRongDaoState, HuaRongDaoAction, typeof settings> = {
  id: "hua-rong-dao",
  title: "Hua Rong Dao",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: `Chinese 4×5 sliding-block puzzle: pick the next optimal block move.`,
  howToPlay: `Hua Rong Dao is a Chinese sliding-block puzzle named for a 3rd-century battle in which the warlord Cao Cao narrowly escaped capture. The puzzle is played on a 4×5 grid with mixed-size blocks: one 2×2 block representing Cao Cao, one 2×1 horizontal, and several 1×1 and 1×2 pieces. The goal is to slide Cao Cao to the bottom exit.

In this solo puzzle adaptation, each puzzle shows a configuration and asks which block to slide next on the optimal escape path.

Eight puzzles per session, 100 points each (800 max).

Tips: the canonical Hua Rong Dao starting position requires 81 moves to escape — Steinhaus posed it in 1932 and computers verified the bound. Always think two moves ahead because each large-block move forces neighbours. The bottom row's exit is in the centre, so Cao Cao must slide straight down through the central two columns. Khun Pan and L'Âne Rouge are sister puzzles with different starting layouts.`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as HuaRongDaoSettings),
  reducer,
  isTerminal,
  component: HuaRongDaoGame,
};
