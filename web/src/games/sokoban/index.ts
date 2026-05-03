import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SokobanState, SokobanAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const Sokoban = /* @__PURE__ */ lazy(() => import("./Sokoban.js").then((mod) => ({ default: mod.Sokoban as unknown as React.ComponentType<unknown> })));
export const sokobanSettings = {
  difficulty: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "medium", "hard"] as const,
    default: "easy" as const,
  },
} as const;

type SokobanSettingsType = SettingsOf<typeof sokobanSettings>;

export const sokobanPlugin: GamePlugin<SokobanState, SokobanAction, typeof sokobanSettings> = {
  id: "sokoban",
  title: "Sokoban",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Push crates onto target squares in this classic warehouse puzzle.",
  howToPlay: `Sokoban is a classic Japanese puzzle game. You play a warehouse worker (@) who must push crates (■) onto target squares (·). When every crate sits on a target square, the level is complete.

Movement rules: you can move in four directions (arrow keys or WASD). You can walk onto any empty floor or target cell. If you step into a crate, you push it one cell in the same direction — but only if the cell beyond the crate is empty floor or a target (not a wall or another crate). You can push crates but never pull them, so think carefully before committing a push.

A crate on a target turns green with a checkmark. The top info bar shows how many crates are placed. If you get stuck, press "Reset Level" to start over.

Score: par_moves − moves_used + 100, with a floor of 50. Par is the designer's intended move count — beating par earns the most points. Easy levels have one or two crates and straightforward paths; hard levels have many crates that must be sequenced carefully.`,
  settings: sokobanSettings,
  initialState: (seed: number, settings: SokobanSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (): HintTarget | null => (typeof document !== "undefined" && document.querySelector(".sokoban-grid")) ? { selector: ".sokoban-grid", pulses: 3 } : null,
  component: Sokoban,
};
