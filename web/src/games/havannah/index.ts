import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { HavannahState, HavannahAction, HavannahSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const Havannah = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.Havannah as unknown as React.ComponentType<unknown> })));
const settings = {} as const;

export const havannahPlugin: GamePlugin<HavannahState, HavannahAction, typeof settings> = {
  id: "havannah",
  title: "Havannah",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Hex board strategy: win by forming a ring, bridge, or fork with your stones.",
  howToPlay: `Havannah was invented by Christian Freeling in 1979. It is played on a hexagonal board (size 5 in this version, giving 61 cells). Players alternate placing one stone per turn on any empty cell. You play black (●); the bot plays white (○).

There are three distinct winning conditions — achieve any one of them:

Ring: a closed loop of your stones surrounding at least one cell (empty or occupied). The loop does not need to enclose your own stones.

Bridge: a chain of your stones connecting any two corner cells of the board. There are six corners, shown in orange.

Fork: a chain of your stones connecting any three distinct edge segments. The board has six edges (between consecutive corners), shown in lighter tan. Corner cells do not count as edges.

The first player to complete any of these three structures wins.

Strategy: try to build stones that contribute toward multiple win conditions simultaneously. Watch the bot's growing chains and block where they approach two corners or two edges. Havannah rewards holistic board vision over local tactics.`,
  settings,
  initialState: (seed: number, s: HavannahSettings) => initialState(seed, s),
  reducer,
  isTerminal,
  hint: (): HintTarget | null => (typeof document !== "undefined" && document.querySelector(".havannah-board")) ? { selector: ".havannah-board", pulses: 3 } : null,
  component: Havannah,
};
