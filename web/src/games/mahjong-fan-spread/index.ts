import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { MahjongState, MahjongAction } from "../_shared/mahjongEngine.js";
import { mahjongHint } from "../_shared/mahjongEngine.js";
import { initialState, reducer, isTerminal } from "./state.js";
const MahjongFanSpreadGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.MahjongFanSpreadGame as unknown as React.ComponentType<unknown> })));
const settings = {} as const;

export const mahjongFanSpreadPlugin: GamePlugin<MahjongState, MahjongAction, typeof settings> = {
  id: "mahjong-fan-spread",
  title: "Mahjong Fan Spread",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Mahjong solitaire on a hand-fan shape that spreads outward from a small handle.",
  howToPlay: "Mahjong Fan Spread is a Mahjong solitaire layout depicting an open Japanese hand fan: a narrow handle at the bottom widens into four ribbed ranks above, with a layer-1 inner spine running across the middle. The wider top ranks expose plenty of free tiles to start.\n\nClick any free tile (no tile on top, with at least one open horizontal edge on its layer) to highlight it, then click a second free tile with the same face to clear the pair. Mismatches simply transfer the highlight. Try to peel the inner spine of layer 1 by clearing tiles flanking it on layer 0 first.\n\nThe handle's two-tile columns are flat and open, so they remain free throughout. Most of your strategy is sequencing match pairs to avoid being left with one matching tile blocked behind another. A complete clear scores up to ten thousand points minus fifty per move played.",
  settings,
  initialState: (seed: number) => initialState(seed),
  reducer,
  isTerminal,
  hint: mahjongHint,
  component: MahjongFanSpreadGame,
};
