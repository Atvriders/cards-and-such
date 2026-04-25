import type { GamePlugin } from "../../platform/game-plugin/types.js";
import { initialState, reducer, isTerminal, type GoldRushIdleState, type GoldRushIdleAction } from "./state.js";
import { GoldRushIdle } from "./GoldRushIdle.js";

export const goldRushIdleSettings = {
  nuggets: { kind: "enum" as const, label: "Nugget Goal", options: ["100", "500", "2500"] as const, default: "100" as const },
} as const;

export const goldRushIdlePlugin: GamePlugin<GoldRushIdleState, GoldRushIdleAction, typeof goldRushIdleSettings> = {
  id: "gold-rush-idle",
  title: "Gold Rush Idle",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Pan for gold, stake claims, hire prospectors — strike it rich in the idle frontier.",
  howToPlay: `Gold Rush Idle sends you out to the frontier to pan for gold. Your goal is to collect a target number of nuggets — 100, 500, or 2,500 — by working the river and building your prospecting crew.

Click the pan button to sift for gold manually. Each pan earns nuggets equal to your Pan Power multiplied by your number of Claims staked. You start with one claim and can buy more to expand your territory.

Hire Prospectors to find gold automatically. Each prospector collects nuggets every second, multiplied by your claim count, and also increases your Pan Power by 1. A large crew of prospectors working multiple claims is the key to a big haul.

Stake additional Claims to multiply all production. Each new claim you stake increases the yield from both manual panning and prospector income. Claims cost twice as much each time, but the multiplicative return is well worth the investment.

There is an 8% chance of a Gold Strike on any manual pan — this rare event delivers double the normal yield for that pan. The progress bar tracks how close you are to the nugget goal.

Strategy tip: stake your second claim as soon as possible, then hire prospectors. The combination of multiple claims and a growing crew compounds quickly into a gold rush.`,
  settings: goldRushIdleSettings,
  initialState,
  reducer,
  isTerminal,
  component: GoldRushIdle,
};
