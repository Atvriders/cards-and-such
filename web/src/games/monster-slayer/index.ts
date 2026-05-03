import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { MonsterSlayerState, MonsterSlayerAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MonsterSlayer } from "./Game.js";

export const monsterSlayerPlugin = {
  id: "monster-slayer",
  title: "Monster Slayer",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Battle through 10 waves of monsters using six combat abilities with cooldowns.",
  howToPlay: `Monster Slayer is a turn-based combat game where you face 10 increasingly dangerous monsters using a set of combat abilities.

Each turn you choose one of six abilities: Slash (heavy 3d6 damage), Bash (2d8 + stuns the monster so it skips its next attack), Pierce (2d6 damage that ignores armor), Guard (+8 armor for this turn, absorbing incoming damage), Potion (heal 15 HP), and Magic (4d4 true damage ignoring all defenses).

Most abilities have cooldowns — you can't spam the same move. Slash has no cooldown and is your bread-and-butter. Bash is powerful but needs 2 turns to recharge. Magic costs 2 turns.

After each action the monster attacks (unless stunned). Your base armor reduces damage. Guard stacks on top of your base armor for one turn. Between waves you heal 20% of max HP.

Monsters grow tougher each wave — more HP, more attack, more armor. The Stone Golem has 4 armor (use Pierce or Magic!), the Dark Mage hits hard (use Guard!), and the Dragon Lord at wave 10 has everything. Surviving all 10 waves scores 100 points; dying earlier scores proportionally.`,
  settings: {} as const,
  initialState: (seed: number) => initialState(seed),
  reducer: reducer as (state: MonsterSlayerState, action: MonsterSlayerAction) => MonsterSlayerState,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "done" || p === "gameover" || p === "ended" || p === "finished" || (s as any).gameOver || (s as any).won || (s as any).complete || (s as any).isComplete) return null; return { selector: ".ms-next", pulses: 3 }; },
  component: MonsterSlayer,
} as unknown as GamePlugin;
