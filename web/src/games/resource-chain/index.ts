import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { ResourceChainState, ResourceChainAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ResourceChain } from "./Game.js";

export const resourceChainPlugin = {
  id: "resource-chain",
  title: "Resource Chain",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Build a production chain from seeds to bread. Manage supply and sell at peak demand!",
  howToPlay: `Resource Chain is a production management game played over 20 turns. You control a supply chain from raw seeds all the way to baked bread, and your goal is to accumulate as many coins as possible.

The chain has four stages: Seeds → Crops → Flour → Bread. Each turn you can perform any combination of actions before clicking End Turn.

Buy Seeds costs 5 coins each. Plant them to yield 2 Crops per seed. Mill 2 Crops to make 1 Flour. Bake 1 Flour to produce 1 Bread. Each loaf of Bread sells for 20 coins at base demand.

The key variable is Demand — a random multiplier that changes each turn between 0.7× and 1.5×. When demand is high (1.3 or above), selling bread earns significantly more. Time your sales accordingly.

Strategy tips: Build a buffer of flour or bread early so you can sell when demand spikes. Don't overspend on seeds before you have the pipeline working. The entire chain costs about 5 coins per bread but earns 14–30 coins — profit depends on demand timing. Reach 400 coins for a perfect score!`,
  settings: {} as const,
  initialState: (seed: number) => initialState(seed),
  reducer: reducer as (state: ResourceChainState, action: ResourceChainAction) => ResourceChainState,
  isTerminal,
  component: ResourceChain,
} as unknown as GamePlugin;
