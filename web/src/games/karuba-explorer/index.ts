import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { KarubaExplorerState, KarubaExplorerAction, KarubaExplorerSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { KarubaExplorerGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const karubaExplorerPlugin: GamePlugin<KarubaExplorerState, KarubaExplorerAction, typeof settings> = {
  id: "karuba-explorer",
  title: "Karuba Explorer",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Karuba-style path tile placement on a 6x6 grid.",
  howToPlay: `Karuba is a path-laying race game. In this adaptation you place 18 random path tiles on a 6x6 grid. Each tile shows one feature: path, jungle, temple, or treasure.

Click any empty cell to place the next tile from the queue.

Scoring (computed at end):
• Path: 1 point base. +1 per orthogonally adjacent path (paths form trails).
• Jungle: 2 points. No bonus or penalty.
• Temple: 5 points each. +3 per orthogonally adjacent path (temples reward connection).
• Treasure: 8 points each. +5 per orthogonally adjacent temple (treasures want temple guards).
• Bonus +10 if your final layout has every temple connected (orthogonal-path-or-direct) to at least one treasure.

The core strategy: link temples to treasures via paths to multiply scoring. Treasures are rare (about 2-3 per game) and worth a lot when clustered with temples. Pure paths are filler but enable the trail bonus.

A strong Karuba run scores 45-65 points. Try to reserve cells around incoming treasures for path/temple combos.`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as KarubaExplorerSettings),
  reducer,
  isTerminal,
  component: KarubaExplorerGame,
};
