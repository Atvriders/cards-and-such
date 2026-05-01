import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { CleverCubedState, CleverCubedAction, CleverCubedSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CleverCubedGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const cleverCubedPlugin: GamePlugin<CleverCubedState, CleverCubedAction, typeof settings> = {
  id: "clever-cubed",
  title: "Clever Cubed",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Clever Cubed — third Clever game with cube-power scoring.",
  howToPlay: `Clever Cubed is a Clever-style dice game with 4 tracks.

How to play
1. Roll 5 dice.
2. Pick one die.
3. Add to any of the 4 colored tracks (A, B, C, D). Tracks fill left-to-right.
4. Score = die value + chain bonus (+2 if previous track cell has same value).

Theme: Cube of count = bonus.

End-of-game bonuses
- Each fully completed track: +5
- All 4 tracks reach at least 3 cells: +6

The game runs 10 rolls. Aim for balanced track filling — chasing one track leaves bonuses on the table.`,
  settings,
  initialState: (seed, s) => initialState(seed, s as CleverCubedSettings),
  reducer,
  isTerminal,
  component: CleverCubedGame,
};
