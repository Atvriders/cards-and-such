import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { PubState, PubAction, PubSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { NineMensMorrisPubGame } from "./Game.js";

const settings = {
  botStrength: { kind: "enum" as const, label: "Bot", options: ["easy", "hard"] as const, default: "easy" as const },
} as const;

type S = SettingsOf<typeof settings>;

export const nineMensMorrisPubPlugin: GamePlugin<PubState, PubAction, typeof settings> = {
  id: "nine-mens-morris-pub",
  title: "Nine Men's Morris (Pub)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Standard Nine Men's Morris with the pub-rule restriction: no flying once down to 3 pieces.",
  howToPlay: `Nine Men's Morris on the standard 24-intersection three-square board. The pub variant removes the optional "flying" endgame rule — when reduced to 3 pieces, you still must move along a line (not jump anywhere), so an immobilised player loses immediately.

Phase 1 — Placing: each player places 9 men, one per turn, on any empty intersection. Forming a "mill" (three of your men aligned along a marked line) lets you remove one of your opponent's pieces (you cannot remove a piece in a mill unless all opponent pieces are in mills).

Phase 2 — Moving: once both players have placed all 9, you slide one of your pieces to an empty adjacent intersection per turn. Forming a mill again lets you remove a piece. Lose by being reduced to fewer than 3 pieces or by having no legal moves.

Click-to-act: in placing phase click any empty intersection; in moving phase click your piece (it highlights), then click an adjacent legal target. After forming a mill, click any opponent piece you may legally remove.

Scoring: win = 100, loss = 0.

Tips: place near intersections with high adjacency (the "T" points). Try to set up "double mills" you can swing back and forth — opening one mill on your turn and closing the other.`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as PubSettings),
  reducer,
  isTerminal,
  component: NineMensMorrisPubGame,
};
