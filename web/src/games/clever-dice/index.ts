import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { CleverDiceState, CleverDiceAction, CleverDiceSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CleverDiceGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const cleverDicePlugin: GamePlugin<CleverDiceState, CleverDiceAction, typeof settings> = {
  id: "clever-dice",
  title: "Clever Dice",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Clever — fill colored tracks with dice values for chain bonuses.",
  howToPlay: `Clever Dice is a Clever-style dice game with 4 tracks.

How to play
1. Roll 5 dice.
2. Pick one die.
3. Add to any of the 4 colored tracks (A, B, C, D). Tracks fill left-to-right.
4. Score = die value + chain bonus (+2 if previous track cell has same value).

Theme: Yellow track: +1 each, all = +5.

End-of-game bonuses
- Each fully completed track: +5
- All 4 tracks reach at least 3 cells: +6

The game runs 10 rolls. Aim for balanced track filling — chasing one track leaves bonuses on the table.`,
  settings,
  initialState: (seed, s) => initialState(seed, s as CleverDiceSettings),
  reducer,
  isTerminal,
  component: CleverDiceGame,
};
