import { lazy } from "react";
import type * as React from "react";
import type { HintTarget, GamePlugin, SettingsOf} from "../../platform/game-plugin/types.js";
import type { AzulStainedGlassState, AzulStainedGlassAction, AzulStainedGlassSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { tileHintSelector } from "../_shared/tile-engine.js";
const AzulStainedGlassGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.AzulStainedGlassGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const azulStainedGlassPlugin: GamePlugin<AzulStainedGlassState, AzulStainedGlassAction, typeof settings> = {
  id: "azul-stained-glass",
  title: "Azul: Stained Glass",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Tile placement: place 15 tiles on a 5x5 grid; score by adjacency.",
  howToPlay: "Azul: Stained Glass is a tile-placement game on a 5x5 grid. A randomized queue of 15 tiles is generated. Each turn the next tile from the queue is shown; click any empty cell to place it. Tile types are: Crimson, Gold, Emerald, Sapphire, Pearl. Each orthogonal pair of same-type tiles scores +2. Same-type connected clusters of 3+ score a +4 bonus, clusters of 5+ score an additional +8. Strategy: place tiles next to existing same-type neighbors to grow clusters efficiently. Don't waste placements in isolated corners. The grid has 25 cells but you only place 15 tiles, so plan compact clusters.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as AzulStainedGlassSettings),
  reducer,
  isTerminal,
  hint: (state: AzulStainedGlassState): HintTarget | null => {
    const sel = tileHintSelector(state, "azulsg-grid");
    return sel ? { selector: sel, pulses: 3 } : null;
  },
  component: AzulStainedGlassGame,
};
