import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type {
  TerraMysticaFullState,
  TerraMysticaFullAction,
} from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";

const TerraMysticaFullGame = /* @__PURE__ */ lazy(() =>
  import("./Game.js").then((m) => ({
    default: m.TerraMysticaFullGame as unknown as React.ComponentType<unknown>,
  })),
);

const terraMysticaFullSettings = {
  _dummy: { kind: "boolean" as const, label: "_", default: false },
} as const;

type TerraMysticaFullSettingsType = SettingsOf<typeof terraMysticaFullSettings>;

export const terraMysticaFullPlugin: GamePlugin<
  TerraMysticaFullState,
  TerraMysticaFullAction,
  typeof terraMysticaFullSettings
> = {
  id: "terra-mystica-full",
  title: "Terra Mystica (Full)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: true },
  description:
    "Pick a faction, terraform a 7-terrain hex map, build dwellings/temples and chase cult tracks across 6 rounds.",
  howToPlay: `Terra Mystica (Full) — minimal-viable XL build. You play one of 4 starter factions against 3 CPU opponents on a 5×7 hex map of 7 terrain types.

Choose your faction first (Witches / Halflings / Engineers / Dwarves). Each has a home terrain — you can only build on hexes of that terrain. Other terrains must be terraformed (paying 3 coin per spade × the cyclic terrain distance, minus your spade-efficiency level).

On your turn, take exactly ONE action then play passes to the next un-passed player:
  • Build a dwelling on an empty hex (1 wood + 2 coin + spade cost).
  • Upgrade dwelling → trading-house, trading → temple or stronghold, temple → sanctuary.
  • Advance shipping (4 coin + 1 priest, +2 VP per step).
  • Advance spade efficiency (5 coin + 1 priest, +2 VP per step).
  • Send a priest to a cult track (fire / water / earth / air) — gain +2 cult-track steps.
  • Pass — you stop acting this round and gain +1 VP from the bonus tile.

Once everyone has passed, the round ends — income is paid (+5 coin, +3 wood, +1 priest) and a new round begins with its own VP scoring tile.

After round 6, end-game scoring runs: cult tracks (1st/2nd/3rd = 8/4/2 VP per track) and area majority (1st/2nd/3rd = 18/12/6 VP by built-hex count). Highest VP wins.

Advanced rules omitted (this is the XL minimal-viable build): power / power-leech mechanic, real income & favor tiles, towns, the other 10 factions, faction-specific stronghold abilities, river-shipping, and connected-area scoring.`,
  settings: terraMysticaFullSettings,
  initialState: (seed: number, settings: TerraMysticaFullSettingsType) =>
    initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "factionSelect") {
      return { selector: '[data-testid="tm-faction-witches"]', pulses: 3 };
    }
    if (state.phase === "scoring") {
      return { selector: '[data-testid="tm-advance-round"]', pulses: 3 };
    }
    if (state.active !== 0) {
      return { selector: '[data-testid="tm-cpu-step"]', pulses: 3 };
    }
    // Suggest the first legal-build hex if any, else pass.
    for (let h = 0; h < state.hexes.length; h++) {
      const hex = state.hexes[h];
      if (!hex) continue;
      const player = state.players[0];
      if (!player) continue;
      if (hex.owner === -1 && hex.terrain === player.home) {
        return { selector: `[data-testid="tm-hex-${h}"]`, pulses: 3 };
      }
    }
    return { selector: '[data-testid="tm-pass"]', pulses: 3 };
  },
  component: TerraMysticaFullGame,
};
