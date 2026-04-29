import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { PubState, PubAction, PubSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PubGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const skittlesEnglishPlugin: GamePlugin<PubState, PubAction, typeof settings> = {
  id: "skittles-english",
  title: "Skittles (English)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Knock down nine pins with a cheese disc.",
  howToPlay: "Skittles (English) is the traditional pub alley game where you throw a wooden 'cheese' disc to knock down a diamond of nine pins. Across ten rounds press Throw; a random outcome decides how many pins you fell: 0-9. About 20% chance of knocking all 9 (a strike), 25% chance of 7-8, 25% of 4-6, 20% of 1-3, and 10% miss completely. Each pin counts one point. The CPU plays each round simultaneously. Total pins after ten rounds wins. English skittles is an ancient pub sport; alleys in Somerset, Devon, and Wiltshire host competitive leagues to this day. The game is mostly luck-of-the-shot in this digital take, though real-world skittles rewards repeatable underhand technique. Press Throw to advance each round; the strike message appears when all 9 fall. Final scoreboard awards 100 points for the win, 25 for a tie. Pour a pint and challenge the CPU — the alley awaits.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as PubSettings),
  reducer,
  isTerminal,
  component: PubGame,
};
