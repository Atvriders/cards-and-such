import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { QawaleStackState, QawaleStackAction, QawaleStackSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const QawaleStackGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.QawaleStackGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const qawaleStackPlugin: GamePlugin<QawaleStackState, QawaleStackAction, typeof settings> = {
  id: "qawale-stack",
  title: "Qawale Stack",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Japanese-inspired stacking abstract — placement adaptation.",
  howToPlay: "Qawale is a 2022 Japanese-inspired stacking abstract by designers Maxime Forest and Pierre Saglier where players push stones onto a 4x4 board to form towers and align colours. This 4x4 placement adaptation captures the territorial side without the stack-pushing puzzle. Across 12 turns you and a random CPU alternate placing pieces on empty squares. Click an empty cell. The CPU plays uniformly random. After twelve moves whoever has more pieces wins. Final scoreboard: 100 for a win, 25 for a tie. Qawale's full ruleset has stacks moved as units along rows or columns, with the top stone determining colour. The visual flow makes it a popular cafe game across Japan and France. Connect Four meets Mancala in the stacking flow. The placement reduction preserves only 'where to plant a token' intuition — the full Qawale rewards reading stack sequences three or four moves ahead. Qawale won the 2023 Tric Trac d'Or for best two-player abstract.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as QawaleStackSettings),
  reducer, isTerminal, hint: (state: QawaleStackState): HintTarget | null => ((state.phase === "playing" && state.turn === "P") ? { selector: ".ab-cell:not(.p):not(.c)", pulses: 3 } : null), component: QawaleStackGame,
};
