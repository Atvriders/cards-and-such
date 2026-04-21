import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GeneralaState, GeneralaAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Generala } from "./Generala.js";

export const generalaSettings = {
  dummy: { kind: "boolean" as const, label: "Standard Rules", default: true },
} as const;

type GeneralaSettingsType = SettingsOf<typeof generalaSettings>;

export const generalaPlugin: GamePlugin<GeneralaState, GeneralaAction, typeof generalaSettings> = {
  id: "generala",
  title: "Generala",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Latin American 5-dice scorecard game — 10 categories, instant win on first-roll Generala.",
  howToPlay: `Generala is a classic Latin American dice game played with 5 dice and 10 scoring categories. Each round, roll up to 3 times and assign the result to one unfilled category.

The 10 categories: Ones through Sixes score the sum of matching faces. Straight (1-2-3-4-5) scores 25 points. Full House (3+2 of different faces) scores 35 points. Four of a Kind scores 45 points. Generala (5 of a kind) scores 60 points.

Special rule — instant win: if you roll a Generala (all 5 dice showing the same face) on your very first roll of a round, the game ends immediately and you win, with 60 bonus points added on top of your existing score.

Click "Roll Dice" to roll. Click dice to lock them between rolls. After 1–3 rolls, click a category to score it. Each category can only be used once.

Tips: always take Generala if you roll it on the first roll — that instant win is a powerful mechanic. Aim for four-of-a-kind and full house early; the fixed 35/45 point values are strong. Use the numbered categories as fallbacks when no combination fits.`,
  settings: generalaSettings,
  initialState: (seed: number, settings: GeneralaSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: Generala,
};
