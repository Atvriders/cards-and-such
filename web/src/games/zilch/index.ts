import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ZilchState, ZilchAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Zilch } from "./Zilch.js";

const zilchSettings = {
  target: {
    kind: "enum" as const,
    label: "Target",
    options: ["5000", "10000"] as const,
    default: "10000" as const,
  },
} as const;

type ZilchSettingsType = SettingsOf<typeof zilchSettings>;

export const zilchPlugin: GamePlugin<ZilchState, ZilchAction, typeof zilchSettings> = {
  id: "zilch",
  title: "Zilch",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Roll 6 dice, set aside scoring combos, and race to 10,000. Three zilches in a row = −500.",
  howToPlay: `Zilch is a press-your-luck dice game for one player racing to 10,000 points (or 5,000 in the short variant).

Each turn, roll all 6 dice. After rolling, select (click) the dice you want to keep — only valid scoring combinations count. Scoring: a single 1 = 100 pts, a single 5 = 50 pts, three-of-a-kind = face × 100 (three 1s = 1000), four-of-a-kind doubles the three-of-a-kind score, and so on.

After selecting dice, you can either Bank (add turn points to your total and end your turn) or Keep & Roll Again (keep the selected dice, add their points to your turn total, and roll the remaining dice). If you use all 6 dice, you reset to a fresh 6-die roll keeping your turn total.

A roll with no scoring options is a Zilch — you lose all points accumulated that turn. Three zilches in a row costs you 500 points. Choose carefully between pushing your luck and banking.

First to reach the target score wins.`,
  settings: zilchSettings,
  initialState: (seed: number, settings: ZilchSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: Zilch,
};
