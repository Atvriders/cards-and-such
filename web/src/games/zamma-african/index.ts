import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { ZammaAfricanState, ZammaAfricanAction, ZammaAfricanSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const ZammaAfricanGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.ZammaAfricanGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const zammaAfricanPlugin: GamePlugin<ZammaAfricanState, ZammaAfricanAction, typeof settings> = {
  id: "zamma-african",
  title: "Zamma (African)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "North African Alquerque cousin — placement adaptation.",
  howToPlay: "Zamma is a North African capture game in the Alquerque family, played across the Maghreb region especially in Morocco and Algeria. The full game uses a 9x9 lined board (or 11x11 in some variants) with diagonal capture rules similar to checkers. This 4x4 placement adaptation captures the territorial spirit. Across 12 turns you and a random CPU alternate placing pieces on empty squares. Click an empty cell. The CPU plays uniformly random. After twelve moves whoever has more pieces wins. Final scoreboard: 100 for a win, 25 for a tie. Zamma boards are often scratched into clay or cement floors at village squares; the game travelled from medieval Spain to Morocco with the Reconquista refugees. Like Alquerque, Zamma has long-distance king pieces. The placement reduction here preserves only the early-game territorial sense; the full Zamma rewards multi-jump captures and king flights. Zamma remains popular at Marrakech tea houses where elders teach grandchildren.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ZammaAfricanSettings),
  reducer, isTerminal, hint: (state: ZammaAfricanState): HintTarget | null => ((state.phase === "playing" && state.turn === "P") ? { selector: ".ab-cell:not(.p):not(.c)", pulses: 3 } : null), component: ZammaAfricanGame,
};
