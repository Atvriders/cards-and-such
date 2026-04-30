import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { CursedCryptState, CursedCryptAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CursedCrypt } from "./Game.js";

export const cursedCryptPlugin = {
  id: "cursed-crypt",
  title: "Cursed Crypt",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "A 6-room linear dungeon delve with binary choices. Fight, dodge traps, and loot your way to the Lich!",
  howToPlay: `Cursed Crypt is a choice-driven dungeon delve through six rooms: five randomized encounters and the fearsome Lich boss at the end.

Each room presents a situation — a monster guarding loot, a suspicious trap, a locked chest, a mystical shrine — along with two choices. Read the room description carefully. The choices have different risk/reward tradeoffs: one might be safer but yield less gold, while the other offers riches at the cost of HP.

Combat rooms: choose to fight head-on (more damage, more gold) or dodge (safer but less reward). Trap rooms: slow and careful is usually safe; reckless speed risks HP. Treasure rooms: smashing vs. picking the lock. Shrine rooms: pray to heal or desecrate for gold.

After each room resolves, click Continue to enter the next room. If your HP reaches zero at any point, you die and the run ends.

The final room is always the Lich — a powerful boss. Arrive with high HP to have the best chance. Choose your combat approach wisely.

Score = 50 base + gold + remaining HP.`,
  settings: {} as const,
  initialState: (seed: number) => initialState(seed),
  reducer: reducer as (state: CursedCryptState, action: CursedCryptAction) => CursedCryptState,
  isTerminal,
  component: CursedCrypt,
} as unknown as GamePlugin;
