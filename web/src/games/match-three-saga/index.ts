import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MatchThreeSagaState, MatchThreeSagaAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MatchThreeSaga } from "./MatchThreeSaga.js";

export const matchThreeSagaSettings = {
  levels: {
    kind: "enum" as const,
    label: "Levels",
    options: ["3", "5", "7"] as const,
    default: "3" as const,
  },
} as const;

type MatchThreeSagaSettingsType = SettingsOf<typeof matchThreeSagaSettings>;

export const matchThreeSagaPlugin: GamePlugin<MatchThreeSagaState, MatchThreeSagaAction, typeof matchThreeSagaSettings> = {
  id: "match-three-saga",
  title: "Match Three Saga",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Swap adjacent gems to match 3 or more in a row, chain combos, and clear level targets!",
  howToPlay: `Match Three Saga is a level-based gem-matching puzzle. A 6×6 grid is filled with five types of colourful gems. Click any gem to select it, then click an adjacent gem to swap them. If the swap creates a row or column of three or more matching gems, they are cleared, you earn points, and new gems fall in from above.

Score enough points to reach the level target and you advance. Each level raises the target score and resets your move count. You have 20 moves per level — use them wisely! Failing to reach the target before running out of moves ends the game.

Combos are key. Matching four gems in a row earns bonus points. Matching five earns even more. If clearing one match causes new gems to fall and create another match automatically, your combo chain multiplier increases — each chained match earns progressively more.

Strategy: look for moves that will cause cascading matches rather than isolated three-gem clears. Prioritise vertical columns since gravity continuously refills from above, making vertical chains easier to predict.

The game runs for 3, 5, or 7 levels. Later levels require much higher scores so plan combos carefully from the start. Your final score is the total accumulated across all levels completed!`,
  settings: matchThreeSagaSettings,
  initialState: (seed: number, settings: MatchThreeSagaSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: MatchThreeSaga,
};
