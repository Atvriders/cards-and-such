import { lazy } from "react";
import type * as React from "react";
import type { HintTarget, GamePlugin, SettingsOf} from "../../platform/game-plugin/types.js";
import type { CarcassonneSouthSeasState, CarcassonneSouthSeasAction, CarcassonneSouthSeasSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { tileHintSelector } from "../_shared/tile-engine.js";
const CarcassonneSouthSeasGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.CarcassonneSouthSeasGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const carcassonneSouthSeasPlugin: GamePlugin<CarcassonneSouthSeasState, CarcassonneSouthSeasAction, typeof settings> = {
  id: "carcassonne-south-seas",
  title: "Carcassonne: South Seas",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Tile placement: place 18 tiles on a 6x6 grid; score by adjacency.",
  howToPlay: "Carcassonne: South Seas is a tile-placement game on a 6x6 grid. A randomized queue of 18 tiles is generated. Each turn the next tile from the queue is shown; click any empty cell to place it. Tile types are: Pearl, Banana, Fish, Boat, Hut. Each orthogonal pair of same-type tiles scores +2. Same-type connected clusters of 3+ score a +4 bonus, clusters of 5+ score an additional +8. Strategy: place tiles next to existing same-type neighbors to grow clusters efficiently. Don't waste placements in isolated corners. The grid has 36 cells but you only place 18 tiles, so plan compact clusters.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as CarcassonneSouthSeasSettings),
  reducer,
  isTerminal,
  hint: (state: CarcassonneSouthSeasState): HintTarget | null => {
    const sel = tileHintSelector(state, "carcss-grid");
    return sel ? { selector: sel, pulses: 3 } : null;
  },
  component: CarcassonneSouthSeasGame,
};
