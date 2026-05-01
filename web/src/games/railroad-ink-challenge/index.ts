import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { RailroadInkChallengeState, RailroadInkChallengeAction, RailroadInkChallengeSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { RailroadInkChallengeGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const railroadInkChallengePlugin: GamePlugin<RailroadInkChallengeState, RailroadInkChallengeAction, typeof settings> = {
  id: "railroad-ink-challenge",
  title: "Railroad Ink Challenge",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Hard-mode Railroad Ink — fewer rolls, higher difficulty bonuses.",
  howToPlay: `Railroad Ink Challenge is a 9-roll dice-and-mark game with themed scoring.

How to play
1. Press Roll to throw a d6.
2. Click any unmarked cell on the 4x4 grid to mark it with that value.
3. Score = die value + zone bonus + adjacency bonus (matching value next door).
4. Skip if no good spot — that roll is wasted.

Theme: Endurance: penalty −2 if any row empty.

End-of-game bonuses
- Full row: +4 each
- Full column: +4 each
- Full board: +12

The game ends after 9 rolls (or earlier if all 16 cells are filled). Maximum reachable depends on a balanced spread; aim for 50-80 in a strong run.`,
  settings,
  initialState: (seed, s) => initialState(seed, s as RailroadInkChallengeSettings),
  reducer,
  isTerminal,
  component: RailroadInkChallengeGame,
};
