import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { DragonHuntState, DragonHuntAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DragonHunt } from "./Game.js";

export const dragonHuntPlugin = {
  id: "dragon-hunt",
  title: "Dragon Hunt",
  category: "strategy",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Scale a tower of 8 floors, managing HP and mana across Strike, Spellfire, Ward, and Rest actions.",
  howToPlay: `Dragon Hunt is a turn-based dungeon scaler. You must defeat 8 guardians on your way up a cursed tower — Guard, Knight, Mage, Warlord, Demon, Lich, Wyvern, and finally the Dragon itself.

Each floor is a single combat. You have four actions each turn:

Strike — deal physical damage (scales with your attack stat, grows each floor). Fast and reliable.
Spellfire — deal powerful magic damage, but costs 2 mana. Best used on tough enemies.
Ward — raise a protective shield, then the enemy attacks. Reduces damage taken.
Rest — recover 6 HP and 2 mana, but the enemy still attacks. Use when you need resources.

After each enemy action, your shield resets to zero, so time Ward carefully. Mana is restored fully between floors. Your attack and magic grow by 1 each floor — you get stronger as you climb.

Clear a floor to advance. You recover 8 HP between floors. Arrive at the Dragon with full mana and high HP for the best chance.

Score = 100 + remaining HP + mana × 5 on victory.`,
  settings: {} as const,
  initialState: (seed: number) => initialState(seed),
  reducer: reducer as (state: DragonHuntState, action: DragonHuntAction) => DragonHuntState,
  isTerminal,
  component: DragonHunt,
} as unknown as GamePlugin;
