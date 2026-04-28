import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { PalificoState, PalificoAction, PalificoSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PalificoGame } from "./Game.js";

const settings = {
  rounds: { kind: "enum" as const, label: "Rounds", options: ["10"] as const, default: "10" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const palificoPlugin: GamePlugin<PalificoState, PalificoAction, typeof settings> = {
  id: "palifico",
  title: "Perudo Palifico",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: `Liar's-dice round where 1s aren't wild — call the CPU's bid or trust it.`,
  howToPlay: `Palifico is a special round in Perudo (Liar's Dice / Dudo) triggered after a player loses their first die. During Palifico, the wild 1s rule is suspended — every face stands on its own, making bluffs riskier and bids more honest.

In this solo version, the CPU makes a bid each round about how many of a face exist among the hidden dice (e.g., "I bid four fives"). You must decide whether to trust the bid (the count is genuinely possible/likely) or to call the bluff (the count is impossible or extremely unlikely given the dice in play).

Calmer CPUs usually have a defensible bid; nervous CPUs are more likely overreaching. Use your gut along with the visible cue.

Each correct read scores 100 points across ten rounds (1000 max). After each round the CPU's actual roll is revealed so you can calibrate your reading skills.

Tips: in Palifico, removing the 1s as wild means a bid of four-of-a-kind from a small pool is far more aggressive. Lean toward calling bluff when the CPU bids a count larger than half the dice on the table.`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as PalificoSettings),
  reducer,
  isTerminal,
  component: PalificoGame,
};
