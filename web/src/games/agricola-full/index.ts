import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { AgricolaState, AgricolaAction, AgricolaSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";

const AgricolaGame = /* @__PURE__ */ lazy(() =>
  import("./Game.js").then((mod) => ({ default: mod.AgricolaGame as unknown as React.ComponentType<unknown> })),
);

const settings = { _dummy: { kind: "boolean" as const, label: "_", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const agricolaFullPlugin: GamePlugin<AgricolaState, AgricolaAction, typeof settings> = {
  id: "agricola-full",
  title: "Agricola (Full)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Worker-placement farming game — 14 rounds, 4 players (you vs 3 CPUs), build the best farm.",
  howToPlay:
    "Agricola is a worker-placement farming game. You and three CPU opponents start with a wooden hut (2 rooms), 2 workers (family members), and 2 food. The game runs for 14 rounds; at the end of rounds 4, 7, 9, 11, 13, and 14 you must feed your family (2 food per worker) and animals breed.\n\nEach round, in starting-player order, place one worker on an available action space. New action spaces unlock each round: take wood/clay/stone/reed, take 1 grain or vegetable, sow a field (yields grain at harvest), fence a pasture (capacity for animals), take 1 sheep/boar/cattle, grow your family (needs an empty hut room), renovate your hut (wood->clay->stone), claim starting-player for next round, or earn food via fishing/day-laborer.\n\nAt harvest, fields yield 1 grain per field, then you pay 2 food per worker (grain and vegetables can be converted 1-for-1). Missing food gives you begging cards worth -3 VP each. Pairs of animals breed; excess animals beyond pasture capacity return to the supply.\n\nFinal scoring rewards diverse, abundant production: fields, grain, vegetables, three animal species (zero of any = -1 VP), upgraded hut rooms (clay = +1/room, stone = +2/room), family size (+3 each), minus any begging cards. Most VP wins!\n\nAdvanced rules omitted in this minimal version: occupation cards, minor/major improvements, stable construction, field-vs-sow distinction, resource accumulation on action spaces, multi-harvest field crops, building extra rooms. The implementation includes a // TODO list in state.ts.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as unknown as AgricolaSettings),
  reducer,
  isTerminal,
  hint: (state: AgricolaState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "placement" && state.currentSeat === 0) {
      // Pulse the family-growth space if it's available + we have an empty room;
      // otherwise pulse "take wood" as the safest default.
      const you = state.players[0];
      if (you && you.totalWorkers < you.rooms &&
          state.unlocked.includes("family") &&
          state.occupied["family"] === undefined) {
        return { selector: '[data-testid="agricola-action-family"]', pulses: 3 };
      }
      return { selector: '[data-testid="agricola-action-wood"]', pulses: 3 };
    }
    if (state.phase === "feeding") {
      return { selector: '[data-testid="agricola-ack-harvest"]', pulses: 3 };
    }
    return null;
  },
  component: AgricolaGame,
};
