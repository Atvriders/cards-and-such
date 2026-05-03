import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { DungeonDelveState, DungeonDelveAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DungeonDelve } from "./Game.js";

export const dungeonDelvePlugin = {
  id: "dungeon-delve",
  title: "Dungeon Delve",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Fight through 10 dungeon rooms using a deck of 20 cards. Block, attack, heal — survive to the end!",
  howToPlay: `Dungeon Delve is a card-based dungeon crawler. You fight through 10 increasingly dangerous rooms using a 20-card deck of combat abilities.

Each combat round you draw 5 cards and have 3 energy to spend. Each card has an energy cost shown on it. Attack cards (Strike, Heavy, Fireball) deal direct damage to the enemy. Defense cards (Shield, Dodge, Ice) build up your Block value, which absorbs the next enemy hit. Heal and Potion restore your HP. Rage is free and gives +3 energy. Poison deals damage now and again next turn.

Click cards to play them, then click End Turn. The enemy attacks — your Block absorbs damage first, then any remaining damage hits your HP. Block resets to 0 each turn, so use it wisely. After every enemy is defeated, you recover 20% HP and advance to the next room.

Strategy: Prioritize Block when enemy attack is high. Use Fireball against tough enemies. Hoard Potions for emergencies. The final Boss hits hard — enter room 10 healthy!`,
  settings: {} as const,
  initialState: (seed: number) => initialState(seed),
  reducer: reducer as (state: DungeonDelveState, action: DungeonDelveAction) => DungeonDelveState,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "done" || p === "gameover" || p === "ended" || p === "finished" || (s as any).gameOver || (s as any).won || (s as any).complete || (s as any).isComplete) return null; return { selector: ".dd-end-turn", pulses: 3 }; },
  component: DungeonDelve,
} as unknown as GamePlugin;
