import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MiniRouletteState, MiniRouletteAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const MiniRoulette = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.MiniRoulette as unknown as React.ComponentType<unknown> })));
export const miniRouletteSettings = {
  spinsPerSession: {
    kind: "number" as const,
    label: "Spins per Session",
    min: 5, max: 100, step: 5, default: 20,
  },
  chipValue: {
    kind: "enum" as const,
    label: "Chip Value",
    options: ["5", "10", "25"] as const,
    default: "10",
  },
} as const;

type MiniRouletteSettingsType = SettingsOf<typeof miniRouletteSettings>;

export const miniRoulettePlugin: GamePlugin<MiniRouletteState, MiniRouletteAction, typeof miniRouletteSettings> = {
  id: "mini-roulette",
  title: "Mini Roulette",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Roulette on a 13-number wheel (0-12). Faster rounds, unique odds.",
  howToPlay: `Mini Roulette uses a compact wheel with just 13 numbers: 0 (green), 1–11 (alternating red/black), and 12 (black). The smaller wheel changes odds compared to full roulette.

Betting: Click any number for a Straight-up bet (pays 11:1). Use the outside buttons for group bets: Red or Black (1:1), Even or Odd (1:1), or any of the four column groups of three numbers (2:1). Place multiple bets per spin by clicking multiple options.

Spin: Once bets are placed, click Spin. The wheel picks a random number 0–12. Winning bets are paid; losing bets are collected. Zero is green and loses all standard outside bets.

Payouts: Straight 11:1, Split 5:1 (if supported), Column 2:1, Red/Black/Even/Odd 1:1.

House edge: With 13 numbers the house edge on even-money bets is 1/13 ≈ 7.7%, higher than full roulette. The straight-up pays 11:1 vs true odds of 12:1.

Strategy: Outside bets give the highest hit frequency. Straights offer big wins but rarely land. Spread bets across multiple numbers to increase coverage.`,
  settings: miniRouletteSettings,
  initialState: (seed: number, settings: MiniRouletteSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: any) => {
    if (isTerminal(state)) return null;
    if ((state as any).phase === "settled") return { selector: '[data-testid="hint-target-mini-roulette-next"]', pulses: 3 };
    const bets = (state as any).bets ?? [];
    if (bets.length === 0) return { selector: '[data-testid="hint-target-mini-roulette-bet"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-mini-roulette-spin"]', pulses: 3 };
  },
  component: MiniRoulette,
};
