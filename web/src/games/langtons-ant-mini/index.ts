import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { AntState, AntAction, AntSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { LangtonsAntMiniGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const langtonsAntMiniPlugin: GamePlugin<AntState, AntAction, typeof settings> = {
  id: "langtons-ant-mini",
  title: "Langton's Ant Mini",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Watch Langton's Ant draw chaos then surprising order on a 12x12 wrapping grid.",
  howToPlay: `Langton's Ant is a classic 2D Turing machine invented by Christopher Langton in 1986. It's a one-player observation puzzle: you watch an ant move on a grid following two simple rules, and watch order emerge from chaos.

The rules:
— On a white cell, the ant turns 90° right, flips the cell to black, and moves forward.
— On a black cell, the ant turns 90° left, flips the cell to white, and moves forward.

That's it. No randomness. The grid is 12x12 with edge wrapping (the ant wraps around the borders), and the ant starts at the center facing north.

How to play:
1. Press Step to advance the ant one move. Watch the grid pattern grow.
2. Press Step x10 to advance ten moves at a time.
3. Press Reset to clear and restart.
4. Press Finish to lock in your score (= total cells flipped, counted with repetitions).

After about 100 steps the ant produces chaotic squiggles. Around step 10,000 (more than fits cleanly in this small grid) it builds a "highway" — but with wrapping enabled here you'll see the ant bounce and reshape the board endlessly. Keep stepping to maximize your flip count.`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as AntSettings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "done" || p === "gameover" || p === "ended" || p === "finished" || (s as any).gameOver || (s as any).won || (s as any).complete || (s as any).isComplete) return null; return { selector: ".la-finish", pulses: 3 }; },
  component: LangtonsAntMiniGame,
};
