import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { MahjongState, MahjongAction } from "../_shared/mahjongEngine.js";
import { mahjongHint } from "../_shared/mahjongEngine.js";
import { initialState, reducer, isTerminal } from "./state.js";
const MahjongMtFujiGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.MahjongMtFujiGame as unknown as React.ComponentType<unknown> })));
const settings = {} as const;

export const mahjongMtFujiPlugin: GamePlugin<MahjongState, MahjongAction, typeof settings> = {
  id: "mahjong-mt-fuji",
  title: "Mahjong Mt Fuji",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Mahjong solitaire on a triangular mountain stack with foothills.",
  howToPlay: "Mahjong Mt Fuji is a Mahjong solitaire layout featuring a triangular mountain stack with foothills. Your goal is to clear every tile by selecting matching pairs from the free (unblocked) tiles. A tile is free when no other tile rests directly on top of it AND at least one of its left or right edges has no neighbor on the same layer. Free tiles glow brightly; blocked tiles appear dim and cannot be selected.\n\nClick one free tile to highlight it in blue, then click another free tile bearing the same face. Matching pairs are removed from the board. If the second click does not match the first, your selection switches to the new tile rather than clearing it. Removing tiles often reveals previously buried tiles, so plan the order carefully — committing to the wrong pair early can lock you out of progress later.\n\nYou win when every tile has been cleared. The game ends in a deadlock when no matching pair remains among the free tiles. A complete clear scores up to 10,000 points minus 50 per move; partial clears earn proportional credit. Take your time, study the layout, and enjoy the puzzle.",
  settings,
  initialState: (seed: number) => initialState(seed),
  reducer,
  isTerminal,
  hint: mahjongHint,
  component: MahjongMtFujiGame,
};
