import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { ZooVadisRwState, ZooVadisRwAction, ZooVadisRwSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const ZooVadisRwGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.ZooVadisRwGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const zooVadisRwPlugin: GamePlugin<ZooVadisRwState, ZooVadisRwAction, typeof settings> = {
  id: "zoo-vadis-rw",
  title: "Zoo Vadis: R&W",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Animal negotiation roll-and-write companion scoring sheet.",
  howToPlay: "Zoo Vadis: R&W is a companion roll-and-write to Zoo Vadis, where dice represent animal influence votes and you record alliances on a 4x4 conservation sheet.\n\nEach round, click Roll to draw a die (1-6) representing political clout. Click any empty cell to register an animal coalition vote. The pip is the vote's weight. Click Skip if the roll won't help your current alliance plan.\n\nScoring:\n- Each marked cell scores its pip value (1-6).\n- +5 per row complete (conservation coalition formed).\n- +5 per column complete (cross-party alliance).\n- +10 for fully contested sheet (zoo charter ratified).\n\n12 rolls total. Zoo Vadis rewards calculated alliance-building — high rolls are tempting to splash anywhere, but a row+column overlap turns a single high pip into a triple bonus. A typical play scores 35-55 points; mastering coalitions reaches 65+. Animal negotiations are nuanced: each vote you cast (or skip) shifts the political balance. Find the swing zoo cells.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ZooVadisRwSettings),
  reducer,
  isTerminal,
  hint: (state: any) => {
    if ((state as any).phase === "done") return null;
    if ((state as any).phase === "rolling") return { selector: '[data-testid="hint-target-zoo-vadis-rw-roll"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-zoo-vadis-rw-skip"]', pulses: 3 };
  },
  component: ZooVadisRwGame,
};
