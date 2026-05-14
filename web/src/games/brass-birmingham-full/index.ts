import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type {
  BrassBirminghamFullState,
  BrassBirminghamFullAction,
  BrassBirminghamFullSettings,
} from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";

const BrassBirminghamFullGame = /* @__PURE__ */ lazy(() =>
  import("./Game.js").then((mod) => ({
    default: mod.BrassBirminghamFullGame as unknown as React.ComponentType<unknown>,
  })),
);

const settings = { _dummy: { kind: "boolean" as const, label: "_", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const brassBirminghamFullPlugin: GamePlugin<BrassBirminghamFullState, BrassBirminghamFullAction, typeof settings> = {
  id: "brass-birmingham-full",
  title: "Brass Birmingham (Full)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Industrial-revolution network and economic game across the West Midlands — canals, rails, mines, and mills.",
  howToPlay:
    "Four players (You + 3 CPUs) compete to industrialise Birmingham across two eras. Era I (Canals) and Era II (Rails) each last 8 turns per player; on your turn you take exactly 2 actions from:\n\n" +
    "BUILD — pay the tile cost (and consume coal/iron from the market) to place an industry tile (coal, iron, cotton, manufactured, brewery) in a city you're allowed to build in. Coal/iron/brewery tiles auto-flip on build, scoring their VP and granting income. Cotton and manufactured tiles must be SOLD later to score.\n\n" +
    "LINK — build a $3 canal (Era I) or $5 + 1 coal rail (Era II) between two adjacent cities. You score VP per link at the end of each era.\n\n" +
    "SELL — flip one of your placed cotton/manufactured tiles to score its VP and gain income.\n\n" +
    "LOAN — take $30 immediately at the cost of 3 income per turn.\n\n" +
    "DEVELOP — remove the lowest-level un-placed tile from your supply for free, freeing slots for stronger tiles.\n\n" +
    "SCOUT — refresh your set of allowed build cities (a simplified card-hand approximation).\n\n" +
    "End of Era I: links score, level-1 unflipped board tiles are removed. End of Era II: same scoring, highest VP wins.\n\n" +
    "Advanced rules omitted for this XL MVP: full card hand, beer market, traders, neighbour beer consumption, double-action card, full coal/iron market price track, and the per-city industry-slot restrictions are all simplified.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as unknown as BrassBirminghamFullSettings),
  reducer,
  isTerminal,
  hint: (state): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "era-scoring") return { selector: '[data-testid="bbf-advance-era"]', pulses: 3 };
    if (state.phase === "playing" && state.currentSeat !== 0) return { selector: '[data-testid="bbf-cpu-step"]', pulses: 3 };
    return { selector: '[data-testid="bbf-build-cotton"]', pulses: 3 };
  },
  component: BrassBirminghamFullGame,
};
