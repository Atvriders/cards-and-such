import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { RaceState, RaceAction, RaceSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { RaceGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const plakotoTavliPlugin: GamePlugin<RaceState, RaceAction, typeof settings> = {
  id: "plakoto-tavli",
  title: "Plakoto Tavli",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Second Tavli variant — pin opponent checkers under your own instead of sending them home.",
  howToPlay: "Plakoto is the second of the three Greek Tavli variants. Its signature mechanic is pinning: instead of hitting opponent blots and sending them to the bar, your checker simply lands on top of the opposing piece and pins it in place. Pinned checkers cannot move until the pinning piece moves on. The race itself is to bear off all fifteen checkers before your opponent can free their pins and finish.\n\nIn this single-player simplification you race against a random CPU. Click Roll to throw two dice; then click any of your checkers to advance it by either die or by the sum. Each die is used once per turn. The track is a linear path of 25 cells; cell 24 is the bear-off zone.\n\nKeep your runners advancing and bear off as fast as possible. The CPU plays random legal moves, so a careful pip-management strategy gives you a clear edge. Score is the pip differential at game end — bear off all checkers to win and earn 100 points plus your pip lead.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as RaceSettings),
  reducer,
  isTerminal,
  component: RaceGame,
};
