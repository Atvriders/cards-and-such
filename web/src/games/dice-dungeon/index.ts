import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { DiceDungeonState, DiceDungeonAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceDungeon } from "./Game.js";

export const diceDungeonPlugin = {
  id: "dice-dungeon",
  title: "Dice Dungeon",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Roll dice to attack or defend against dungeon monsters across 7 rooms. Survive to win!",
  howToPlay: `Dice Dungeon is a turn-based dungeon crawler where all combat is resolved by rolling dice. You face 7 increasingly dangerous monsters across 7 rooms.

Each turn you have two choices: Roll Attack or Roll Defend. Rolling Attack pits your dice total against the enemy's attack dice total — you deal your roll to the enemy, and the enemy deals their roll to you (reduced by any active shield). Rolling Defend sets your shield value to your dice total for the next attack exchange.

Your starting pool is 2d6. Every third room you gain an extra die, growing your potential damage and defense. Enemies scale in both HP and attack dice — later rooms demand careful shield management.

After defeating each enemy you recover 8 HP and advance. Survive all 7 rooms — Goblin, Skeleton, Orc, Witch, Vampire, Dragon, Lich — to escape the dungeon.

Strategy: Use Defend when enemy dice outnumber yours. Save attack rolls for when you can finish off weakened enemies. Shield only lasts one exchange, so time it well!`,
  settings: {} as const,
  initialState: (seed: number) => initialState(seed),
  reducer: reducer as (state: DiceDungeonState, action: DiceDungeonAction) => DiceDungeonState,
  isTerminal,
  hint: (state: any) => {
    if ((state as any).phase === "gameover" || (state as any).gameOver) return null;
    if ((state as any).phase === "reward") return { selector: '[data-testid="hint-target-dice-dungeon-next"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-dice-dungeon-roll"]', pulses: 3 };
  },
  component: DiceDungeon,
} as unknown as GamePlugin;
