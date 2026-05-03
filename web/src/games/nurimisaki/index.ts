import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { NurimisakiState, NurimisakiAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const Nurimisaki = /* @__PURE__ */ lazy(() => import("./Nurimisaki.js").then((mod) => ({ default: mod.Nurimisaki as unknown as React.ComponentType<unknown> })));
const nurimisakiSettings = {
  difficulty: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "hard"] as const,
    default: "easy",
  },
} as const;

type S = SettingsOf<typeof nurimisakiSettings>;

export const nurimisakiPlugin: GamePlugin<NurimisakiState, NurimisakiAction, typeof nurimisakiSettings> = {
  id: "nurimisaki",
  title: "Nurimisaki",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Shade cells black to leave white peninsulas; each circle marks a peninsula tip.",
  howToPlay: `Nurimisaki is a Japanese grid-shading puzzle whose name means "cape" or "peninsula." Your goal is to shade some cells black and leave the rest white, following these rules.

First, all white cells must form a single connected group — you cannot leave isolated patches of white. Second, no 2×2 square of cells may be entirely white. Third, the white region must consist of corridors rather than blobs; every white cell that is a dead-end (exactly one white neighbour) is called a peninsula tip, and must be marked with a circle. Conversely, every circled cell must be a peninsula tip.

Some circles carry a number. That number tells you the length of the straight-line corridor stretching away from that tip — counting the tip itself. A circle with 2 means the corridor is only two cells long before it hits a junction or turns.

Click a cell to cycle it through unknown (grey), white, and black. Circled cells are fixed as white — clicking them only toggles a marker. Use the clue counts and connectivity rules together to deduce which cells must be shaded.

Click Reset to start over.`,
  settings: nurimisakiSettings,
  initialState: (seed: number, settings: S) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver || (s as any).won || (s as any).isWon || (s as any).isComplete || (s as any).complete) return null; return { selector: '[data-testid="hint-target-nurimisaki-action"]', pulses: 3 }; },
  component: Nurimisaki,
};
