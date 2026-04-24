import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { IslandState, IslandAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { IslandSurvival } from "./Game.js";

export const islandSurvivalPlugin = {
  id: "island-survival",
  title: "Island Survival",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Stranded on a desert island! Manage food, water, and shelter for 20 days. Survive or get rescued!",
  howToPlay: `Island Survival is a turn-based resource management game. You are stranded on a desert island and must survive 20 days — or get lucky and get rescued early.

You have four resources to manage: Food (depletes 15/day), Water (depletes 20/day), Shelter (protects you from storms), and Health (drops when resources run out). If Health reaches zero, you perish.

Each day you choose one primary action. Forage Food searches for fruit and small animals, restoring 30–50 food. Find Water locates streams or collects morning dew, restoring 35–50 water. Build Shelter reinforces your camp, adding 25 shelter points — critical protection when storms hit. Light a Signal Fire does nothing directly, but massively boosts your chance of getting rescued if a rescue craft passes by.

After choosing your action, a random event may occur. Storms damage your shelter and health — higher shelter means less damage. Rain top-ups water for free. Coconut bounties add food. And rarely, a rescue helicopter or ship appears: if you lit a signal fire that day, you are rescued immediately for a perfect score!

Keep all four bars healthy. If water hits zero you lose 20 health per day — that kills you in five days. Shelter below 20 costs 5 health per storm. Prioritize water and food, invest in shelter early, and keep watching for that rescue!`,
  settings: {} as const,
  initialState: (seed: number) => initialState(seed),
  reducer: reducer as (state: IslandState, action: IslandAction) => IslandState,
  isTerminal,
  component: IslandSurvival,
} as unknown as GamePlugin;
