import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { AzulFullState, AzulFullAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";

const AzulFullGame = /* @__PURE__ */ lazy(() =>
  import("./Game.js").then((m) => ({
    default: m.AzulFullGame as unknown as React.ComponentType<unknown>,
  })),
);

const azulFullSettings = {
  cpuLevel: {
    kind: "enum" as const,
    label: "CPU Skill",
    options: ["easy", "normal"] as const,
    default: "normal" as const,
  },
} as const;

type AzulFullSettingsType = SettingsOf<typeof azulFullSettings>;

export const azulFullPlugin: GamePlugin<
  AzulFullState,
  AzulFullAction,
  typeof azulFullSettings
> = {
  id: "azul-full",
  title: "Azul (Full)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: true },
  description:
    "Tile-draft pattern-building; complete rows and columns for end-game bonuses.",
  howToPlay: `Azul (Full) is the canonical 3-seat tile-drafting game: you versus two CPU opponents. Each round, 5 factories are filled with 4 colored tiles each. On your turn, pick all tiles of ONE color from either a factory (the rest slide to the center pool) or from the center (whoever picks first from the center this round also collects the −1 first-player marker into their floor row). Place the taken tiles on one of your five pattern rows. A row may only hold one color, and that color's wall cell on that row must not already be filled. Excess tiles spill onto the floor (penalty: −1, −1, −2, −2, −2, −3, −3 per slot).

When all factories and the center are empty, the wall-tiling phase runs: every full pattern row sends one tile to the wall in the designated column for that color, scoring 1 plus the size of any connected horizontal or vertical run it joins (counting both if both exist). Apply floor penalties (score never goes below zero). If any player completed a full horizontal wall row, the game ends after this phase; otherwise factories refill and the player who took the first-player marker starts the next round.

End-game bonuses: +2 per complete row, +7 per complete column, +10 per color set (all 5 tiles of one color on the wall).

CPU strategy: greedy — for every legal (source, color, row) combination it estimates the immediate placement score minus the floor penalty and a small bias toward larger pattern rows.`,
  settings: azulFullSettings,
  initialState: (seed: number, settings: AzulFullSettingsType) =>
    initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "tiling") {
      return { selector: '[data-testid="azul-full-advance-tiling"]', pulses: 3 };
    }
    if (state.active !== 0) {
      return { selector: '[data-testid="azul-full-cpu-step"]', pulses: 3 };
    }
    // Suggest the first factory (or center) that has tiles for the player.
    for (let i = 0; i < state.factories.length; i++) {
      const f = state.factories[i];
      if (f && f.some((n) => n > 0)) {
        return { selector: `[data-testid="azul-full-factory-${i}"]`, pulses: 3 };
      }
    }
    return { selector: '[data-testid="azul-full-center"]', pulses: 3 };
  },
  component: AzulFullGame,
};
