import { lazy } from "react";
import type * as React from "react";
import type { HintTarget, GamePlugin, SettingsOf} from "../../platform/game-plugin/types.js";
import type { KingdominoState, KingdominoAction, KingdominoSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { tileHintSelector } from "../_shared/tile-engine.js";
const KingdominoGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.KingdominoGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const kingdominoPlugin: GamePlugin<KingdominoState, KingdominoAction, typeof settings> = {
  id: "kingdomino",
  title: "Kingdomino",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Tile placement: place 16 tiles on a 5x5 grid; score by adjacency.",
  howToPlay: "Kingdomino is a tile-placement game on a 5x5 grid. A randomized queue of 16 tiles is generated. Each turn the next tile from the queue is shown; click any empty cell to place it. Tile types are: Wheat, Grass, Forest, Lake, Swamp, Mine. Each orthogonal pair of same-type tiles scores +2. Same-type connected clusters of 3+ score a +4 bonus, clusters of 5+ score an additional +8. Strategy: place tiles next to existing same-type neighbors to grow clusters efficiently. Don't waste placements in isolated corners. The grid has 25 cells but you only place 16 tiles, so plan compact clusters.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as KingdominoSettings),
  reducer,
  isTerminal,
  hint: (state: KingdominoState): HintTarget | null => {
    const sel = tileHintSelector(state, "kdom-grid");
    return sel ? { selector: sel, pulses: 3 } : null;
  },
  component: KingdominoGame,
};
