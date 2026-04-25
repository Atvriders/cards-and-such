import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { WireConnectState, WireConnectAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { WireConnect } from "./WireConnect.js";

const wireConnectSettings = {
  size: {
    kind: "enum" as const,
    label: "Grid Size",
    options: ["4", "5", "6"] as const,
    default: "4" as const,
  },
} as const;

export const wireConnectPlugin: GamePlugin<WireConnectState, WireConnectAction, typeof wireConnectSettings> = {
  id: "wire-connect",
  title: "Wire Connect",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Rotate wire tiles to connect all wires back to the power source.",
  howToPlay: `The grid contains wire tiles, each showing one or more wire segments. A red source tile provides power. Your goal is to rotate the other tiles so every wire segment is part of a continuous network connected to the source.

Click any non-fixed tile to rotate it 90 degrees clockwise. Wires connect between adjacent tiles only when both tiles have a wire segment facing each other. For example, if tile A has a wire going east and the tile to its right has a wire going west, they are connected.

The puzzle is solved when all tiles with wires are reachable from the source through connected wires. When solved, the wires turn green.

Two wires facing the same edge of a tile do not connect unless the adjacent tile has a matching wire — every connection must be mutual. Dead-end tiles (one wire only) simply need their single wire pointed toward a connected neighbor.

Tips: start from the fixed source tile and trace outward, rotating tiles to match their neighbors. Work systematically row by row. On larger grids, identify corner tiles (which must use specific rotations) to anchor your solution.`,
  settings: wireConnectSettings,
  initialState,
  reducer,
  isTerminal,
  component: WireConnect,
};
