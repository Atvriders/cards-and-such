import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DuckShootState, DuckShootAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const DuckShoot = /* @__PURE__ */ lazy(() => import("./DuckShoot.js").then((mod) => ({ default: mod.DuckShoot as unknown as React.ComponentType<unknown> })));
export const duckShootSettings = {
  rounds: {
    kind: "enum" as const,
    label: "Rounds",
    options: ["3", "5", "10"] as const,
    default: "5" as const,
  },
  ammo: {
    kind: "enum" as const,
    label: "Ammo per Round",
    options: ["5", "10", "15"] as const,
    default: "10" as const,
  },
} as const;

type DuckShootSettingsType = SettingsOf<typeof duckShootSettings>;

export const duckShootPlugin: GamePlugin<DuckShootState, DuckShootAction, typeof duckShootSettings> = {
  id: "duck-shoot",
  title: "Duck Shoot",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Click to shoot flying ducks. Limited ammo per round — make every shot count.",
  howToPlay: `Ducks fly across the sky in random directions, bouncing off the edges of the screen. Click directly on a duck to shoot it. Each hit earns one point. You have a limited number of shots per round, shown as a row of bullets in the info bar. When you run out of ammo or all ducks in the round are hit, the round ends automatically and the next one begins after a brief pause.

The game consists of 3, 5, or 10 rounds. Each round features 6 ducks flying around the arena. You can adjust the ammo per round from 5 to 15. With fewer shots you must be precise; with more shots you can afford to spray and pray.

Ducks move at varying speeds — some drift lazily, others dart across quickly. Faster ducks are harder to hit but count the same as slow ones.

Tips: Click slightly ahead of a moving duck to lead your shot — there is a small aim radius so you don't need to be pixel-perfect, but precision matters more with limited ammo. Let multiple ducks gather on one side of the screen before shooting to get them when they are close together. Avoid wasting shots on ducks near the edges that are about to reverse direction.`,
  settings: duckShootSettings,
  initialState: (seed: number, settings: DuckShootSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
    hint: (state: DuckShootState) => {
      if (isTerminal(state)) return null;
      return { selector: '[data-testid="hint-target-duck-shoot-action"]', pulses: 3 };
    },
  component: DuckShoot,
};
