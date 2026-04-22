import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GluckshausState, GAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Gluckshaus } from "./Gluckshaus.js";

export const gluckshausSettings = {
  startingPennies: {
    kind: "enum" as const,
    label: "Starting Pennies",
    options: ["10", "15", "20"] as const,
    default: "10",
  },
} as const;

type GluckshausSettingsType = SettingsOf<typeof gluckshausSettings>;

export const gluckshausPlugin: GamePlugin<GluckshausState, GAction, typeof gluckshausSettings> = {
  id: "gluckshaus",
  title: "Glückshaus",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "German Lucky House! Roll 2 dice and collect pennies from slots — but beware of 7, which feeds the wedding pot. Last one with pennies wins!",
  howToPlay: `Glückshaus (German for "Lucky House") is a traditional German dice game with a beautifully simple board. The board has numbered slots from 2–12 (no slot 4). You alternate turns rolling two dice with the bot; the sum determines what happens.

On each roll:
- Sum 5, 6, 8, 9, or 10: If the matching slot has a penny, take it. If the slot is empty, place a penny there (if you have one).
- Sum 7 (Wedding): Place one of your pennies into the center Wedding Pot.
- Sum 2 (Lucky!): Take the entire Wedding Pot!
- Sum 3 or 11: Nothing happens — safe roll!
- Sum 12 (Jackpot!): Take all pennies from every slot plus the Wedding Pot.

The Wedding Pot can grow large if 7s keep coming. Rolling a 2 can be a huge windfall! Meanwhile, rolling 12 is the rarest but most powerful result.

You lose when you run out of pennies. The bot loses when it runs out. So you're both racing to stay solvent while draining each other through the board mechanics.

Start with 10, 15, or 20 pennies. The game ends as soon as one player reaches zero. Good luck!`,
  settings: gluckshausSettings,
  initialState: (seed: number, settings: GluckshausSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: Gluckshaus,
};
