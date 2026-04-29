import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { TzaarStonesState, TzaarStonesAction, TzaarStonesSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TzaarStonesGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const tzaarStonesPlugin: GamePlugin<TzaarStonesState, TzaarStonesAction, typeof settings> = {
  id: "tzaar-stones",
  title: "TZAAR Stones",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Project Gipf capture-stacks abstract — placement adaptation.",
  howToPlay: "TZAAR is the fifth Gipf-Project game by Kris Burm where players try to capture all of an opponent's stack types — Tzaars, Tzarras, or Totts. The full game uses a 60-piece hexagonal board with three piece types per side and capture-by-stacking rules. This 5x5 placement adaptation captures the initial territorial setup. Across 14 turns you and a random CPU alternate placing pieces on empty squares. Click an empty cell. The CPU plays uniformly random. After fourteen moves the player with more pieces wins. Final scoreboard: 100 for a win, 25 for a tie. TZAAR won the 2008 IGA Game of the Year award; many critics call it the most strategically demanding Gipf game. The win condition that you must keep at least one piece of each type alive creates triple-pronged calculation rare in abstracts. The placement reduction here only preserves the initial setup intuition; serious TZAAR play involves stack-stack-stack capture combinations that resemble checkers across hex space.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as TzaarStonesSettings),
  reducer,
  isTerminal,
  component: TzaarStonesGame,
};
