import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { NimState, NimAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Nim } from "./Nim.js";

export const nimSettings = {
  piles: {
    kind: "enum" as const,
    label: "Number of Piles",
    options: ["3", "4", "5"] as const,
    default: "3",
  },
  rule: {
    kind: "enum" as const,
    label: "Rule",
    options: ["standard", "misere"] as const,
    default: "misere",
  },
} as const;

type NimSettingsType = SettingsOf<typeof nimSettings>;

export const nimPlugin: GamePlugin<NimState, NimAction, typeof nimSettings> = {
  id: "nim",
  title: "Nim",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Remove stones from piles — avoid (or take) the last one.",
  howToPlay: `Nim is a two-player strategy game played with several piles of stones. On your turn, choose any one pile and remove as many stones as you like from it (at least one). You and the bot alternate turns.

Standard rule: the player who takes the last stone wins. Misère rule: the player who takes the last stone loses. All other rules remain identical — only the goal changes.

To move, click the + and − buttons below a pile to set how many stones to remove, then press "Take." The bot plays immediately after you.

The bot uses perfect mathematical play based on XOR of pile sizes (Sprague-Grundy theory). In Standard Nim, the winning strategy is to always leave the XOR of all pile sizes equal to zero. In Misère Nim, the strategy is identical except in the end-game when all piles have at most one stone.

Settings: Piles changes the number of piles (3–5); each pile starts with a random 3–9 stones. Rule switches between Standard and Misère.

Scoring: win = 100, loss = 0. The bot plays near-perfectly, so finding a win is a genuine challenge unless you go first in a losing position for the bot.`,
  settings: nimSettings,
  initialState: (seed: number, settings: NimSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: Nim,
};
