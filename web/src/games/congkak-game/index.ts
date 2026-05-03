import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GameState, GameAction, GameSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const CongkakGameGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.CongkakGameGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const congkakGamePlugin: GamePlugin<GameState, GameAction, typeof settings> = {
  id: "congkak-game",
  title: "Congkak",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Southeast Asian Mancala on a 5x5 grid — sow and capture. Place vs random CPU.",
  howToPlay: "Congkak is a popular Southeast Asian Mancala variant played in Malaysia, Indonesia, and the Philippines on two rows of 7 pits. The game involves picking up stones and sowing them counterclockwise around the pits, with captures triggered by landing in your home pit. In this compact 5x5 grid placement adaptation, the sow-and-capture spirit survives through positional play.\n\nClick any empty cell to place a P piece. If your placement is on a cell whose column equals 0 or whose row equals 4 (the home pit rows), every C piece in the same row is captured and removed. After your turn, a random CPU places a C piece on an empty cell that may symmetrically capture P pieces in its row if it lands on a home cell.\n\nGameplay lasts up to 18 moves or until the board fills. You earn 100 points for ending with more P pieces than C pieces, 25 for a tie, plus 3 points per surviving P piece. The home-row capture rule makes left column and bottom row extraordinarily valuable. Save your captures for when there are many CPU pieces in a target row.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as GameSettings),
  reducer,
  isTerminal,
  hint: (): HintTarget | null => (typeof document !== "undefined" && document.querySelector(".cgk-board")) ? { selector: ".cgk-board", pulses: 3 } : null,
  component: CongkakGameGame,
};
