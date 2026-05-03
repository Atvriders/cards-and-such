import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { GridRogueState, GridRogueAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { GridRogue } from "./Game.js";

export const gridRoguePlugin = {
  id: "grid-rogue",
  title: "Grid Rogue",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Navigate a 10×10 ASCII dungeon, fight monsters, collect gold, and reach the exit across 5 floors.",
  howToPlay: `Grid Rogue is an ASCII-style turn-based dungeon crawler on a 10×10 grid. You start at the top-left corner and must reach the exit (X) at the bottom-right to advance to the next floor. There are 5 floors total — escape them all to win.

Symbols: @ is you, ☠ are enemies, ♥ are potions, $ is gold, █ are walls, X is the exit.

Use the arrow buttons to move one step at a time. Moving into an enemy starts combat: you and the enemy exchange blows each turn. The enemy dies when its HP hits zero. You take damage if the enemy survives the hit, so build up a strategy — some enemies are far tougher than others.

Potions restore HP when you walk over them. Gold increases your final score but has no other effect. Your attack power grows slightly each floor.

Tip: clear enemies before heading for the exit so you don't get caught from behind. Potions are precious — don't waste them early. The dungeon is procedurally generated each run, so every game is different. Good luck, adventurer!`,
  settings: {} as const,
  initialState: (seed: number) => initialState(seed),
  reducer: reducer as (state: GridRogueState, action: GridRogueAction) => GridRogueState,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-grid-rogue-action"]', pulses: 3 }; },
  component: GridRogue,
} as unknown as GamePlugin;
