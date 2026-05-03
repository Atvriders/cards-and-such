import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { BrianState, BrianAction, BrianSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BrainOfBrianGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const brainOfBrianPlugin: GamePlugin<BrianState, BrianAction, typeof settings> = {
  id: "brain-of-brian",
  title: "Brain of Brian",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Brian's Brain 3-state cellular automaton. Alive, dying, dead — keep activity going.",
  howToPlay: `Brain of Brian is a one-player simulation of Brian Silverman's "Brian's Brain" cellular automaton — a 3-state cousin of Conway's Game of Life. Cells are alive (green), dying (blue), or dead (gray) on an 8x8 grid.

Rules every step:
— A live cell becomes a dying cell.
— A dying cell becomes dead.
— A dead cell becomes alive only if it has EXACTLY 2 live neighbors.

This produces lots of "spaceships" — small patterns that fly across the grid leaving blue trails behind them. Brian's Brain is famous for the gun- and glider-like activity that emerges naturally from random soup.

How to play:
1. Click cells to toggle them alive (green) — or press Random to fill ~30% of the grid.
2. Press Step to advance one generation. Watch alive cells fade through dying to dead while new alive cells spawn at exactly-2-neighbor sites.
3. Press Reset to clear. Press Finish to lock in your score.

Score = live-cell count summed across every generation, plus 3 × generations. Patterns often run for dozens of steps on this small board before settling. A random fill typically scores 200+ once you step it 20-30 times.`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as BrianSettings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "done" || p === "gameover" || p === "ended" || p === "finished" || (s as any).gameOver || (s as any).won || (s as any).complete || (s as any).isComplete) return null; return { selector: ".brb-step", pulses: 3 }; },
  component: BrainOfBrianGame,
};
