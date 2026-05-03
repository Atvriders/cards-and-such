import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { MineDelverState, MineDelverAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MineDelver } from "./Game.js";

export const mineDelverPlugin = {
  id: "mine-delver",
  title: "Mine Delver",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Dig through 10 rows of the mine, collect ore and gems, avoid monsters and lava, reach the ladder!",
  howToPlay: `Mine Delver is a digging roguelike. The mine is an 8×10 grid of hidden tiles. You start above the top row and must dig your way down row by row to find the escape ladder at the bottom.

Each turn, the next row is revealed. Click any tile in that row to dig through it. Different tiles have different effects: Ore and Gems give you gold that boosts your score. Monsters deal damage equal to their attack value — fight carefully! Lava tiles deal 10 damage — avoid them if you can see them before committing.

The ladder tile at the bottom-right is your escape. Reach it to win. If your HP hits zero, you die in the mine.

Revealed tiles show their icon: ◆ ore, ✦ gem, ☠ monster, ▲ lava, ↑ ladder, █ rock. One row ahead is always visible so you can plan your path.

Score = 50 base + gold collected + 5 per row reached. Explore greedily but don't take unnecessary damage — HP is your lifeline!`,
  settings: {} as const,
  initialState: (seed: number) => initialState(seed),
  reducer: reducer as (state: MineDelverState, action: MineDelverAction) => MineDelverState,
  isTerminal,
  hint: (): HintTarget | null => (typeof document !== "undefined" && document.querySelector(".md-grid")) ? { selector: ".md-grid", pulses: 3 } : null,
  component: MineDelver,
} as unknown as GamePlugin;
