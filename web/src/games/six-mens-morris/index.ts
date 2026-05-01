import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { GameState, GameAction, SixMorrisSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SixMensMorrisGame } from "./Game.js";

const settings = {
  botStrength: { kind: "enum" as const, label: "Bot", options: ["easy", "hard"] as const, default: "easy" as const },
} as const;

type S = SettingsOf<typeof settings>;

export const sixMensMorrisPlugin: GamePlugin<GameState, GameAction, typeof settings> = {
  id: "six-mens-morris",
  title: "Six Men's Morris",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Smaller Morris variant: 16 intersections, 6 men each, 8 mill lines (rows of inner & outer square). Form a mill, remove a piece.",
  howToPlay: `Six Men's Morris uses 16 intersections (two concentric squares connected through their mid-sides) and 6 men per player. There are no diagonal mills.

Phase 1 — Placing: each player places 6 men, one per turn, on any empty intersection. Forming a mill (three of your men aligned along a marked horizontal or vertical line of either square) lets you remove one of your opponent's pieces (you cannot remove a piece in a mill unless all opponent pieces are in mills).

Phase 2 — Moving: once both players have placed all 6, you slide one of your pieces to an empty adjacent intersection per turn. Forming a mill again lets you remove a piece. Lose by being reduced to fewer than 3 pieces or by having no legal moves.

Click-to-act: in placing phase click any empty intersection; in moving phase click your piece (it highlights), then click an adjacent legal target. After forming a mill, click any opponent piece you may legally remove.

Scoring: win = 100, loss = 0.

Tips: the four mid-side intersections (where the squares connect) are the most flexible — they're part of two adjacency chains. Watch for "double mills" you can break and re-form.`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SixMorrisSettings),
  reducer,
  isTerminal,
  component: SixMensMorrisGame,
};
