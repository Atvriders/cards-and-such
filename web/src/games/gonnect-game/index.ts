import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GameState, GameAction, GameSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const GonnectGameGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.GonnectGameGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const gonnectGamePlugin: GamePlugin<GameState, GameAction, typeof settings> = {
  id: "gonnect-game",
  title: "Gonnect",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Go + connection hybrid — connect opposite sides of the board. Place vs random CPU.",
  howToPlay: "Gonnect is a 2000 invention by Joao Pedro Neto that fuses Go (capture rules) with Hex (connection goal) — the first player to connect their two opposite sides of the board with an unbroken chain of stones wins. Stones may also be captured Go-style by surrounding all their liberties. In this compact 6x6 grid adaptation, the connection-and-capture spirit is preserved with simplified rules.\n\nClick any empty cell to place a P piece. You aim to form a chain of P pieces connecting the bottom row to the top row through orthogonally-adjacent placements. After your turn, a random CPU places a C piece anywhere empty.\n\nGameplay continues for up to 20 moves or until you complete a top-to-bottom chain. You earn 100 points for completing the connection, 25 for a draw at move cap, plus 3 points per P piece on the board. Strategy: place along a single column to maximize your reach, but use diagonal-of-the-board parallel chains to defend against CPU pieces that randomly land on your line. Two-wide chains are unbreakable by random CPU placement.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as GameSettings),
  reducer,
  isTerminal,
  hint: (): HintTarget | null => (typeof document !== "undefined" && document.querySelector(".gnc-board")) ? { selector: ".gnc-board", pulses: 3 } : null,
  component: GonnectGameGame,
};
