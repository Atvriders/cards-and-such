import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { LootGoblinState, LootGoblinAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { LootGoblin } from "./Game.js";

export const lootGoblinPlugin = {
  id: "loot-goblin",
  title: "Loot Goblin",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Push your luck looting dungeon rooms — collect gold but flee before 3 traps catch you!",
  howToPlay: `Loot Goblin is a push-your-luck game where you play as a sneaky goblin looting a dungeon. Each room contains gold — but also trap dice.

When you enter a room, trap dice are rolled (d6 each). Any die showing 5 or 6 triggers a trap token. Collect 3 trap tokens and you're caught — losing all gold held during this run.

After clearing a room you face a choice: bank your held gold and escape safely, or press on to the next room for even more loot. Each deeper room has more gold but more trap dice. Room 1 has 1 trap die and 5 gold. Room 10 (The Sanctum) has 5 trap dice and 100 gold.

Banked gold is safe — it's only your held gold that gets lost if you're caught. So you can make multiple runs if you escape early each time. A score of 100 requires banking around 200 gold total.

Strategy: The early rooms are nearly safe (1-2 dice, low trap chance). Room 6 onwards gets genuinely dangerous. Consider banking after clearing rooms 4-5 on each run and running multiple times rather than going all the way to room 10 in one go. Greed is the enemy.`,
  settings: {} as const,
  initialState: (seed: number) => initialState(seed),
  reducer: reducer as (state: LootGoblinState, action: LootGoblinAction) => LootGoblinState,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "done" || p === "gameover" || p === "ended" || p === "finished" || (s as any).gameOver || (s as any).won || (s as any).complete || (s as any).isComplete) return null; return { selector: ".lg-btn", pulses: 3 }; },
  component: LootGoblin,
} as unknown as GamePlugin;
