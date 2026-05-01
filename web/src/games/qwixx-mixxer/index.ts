import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { QwixxMixxerState, QwixxMixxerAction, QwixxMixxerSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { QwixxMixxerGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const qwixxMixxerPlugin: GamePlugin<QwixxMixxerState, QwixxMixxerAction, typeof settings> = {
  id: "qwixx-mixxer",
  title: "Qwixx MixXxer",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Roll five dice, distribute to four colored tracks for combos.",
  howToPlay: `Qwixx MixXxer is a Clever-style dice game with 4 tracks.

How to play
1. Roll 5 dice.
2. Pick one die.
3. Add to any of the 4 colored tracks (A, B, C, D). Tracks fill left-to-right.
4. Score = die value + chain bonus (+2 if previous track cell has same value).

Theme: 5-dice scorer with 4-color tracks.

End-of-game bonuses
- Each fully completed track: +5
- All 4 tracks reach at least 3 cells: +6

The game runs 10 rolls. Aim for balanced track filling — chasing one track leaves bonuses on the table.`,
  settings,
  initialState: (seed, s) => initialState(seed, s as QwixxMixxerSettings),
  reducer,
  isTerminal,
  component: QwixxMixxerGame,
};
