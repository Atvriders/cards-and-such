import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { Pool10ballState, Pool10ballAction, Pool10ballSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Pool10ballGame } from "./Game.js";

const settings = { dummy: { kind:"boolean" as const, label:"Standard rules", default:true } } as const;
type S = SettingsOf<typeof settings>;

export const pool10ballPlugin: GamePlugin<Pool10ballState, Pool10ballAction, typeof settings> = {
  id: "pool-10ball",
  title: "10-Ball Pool",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: '10-Ball Pool: pocket balls in order; sink the 10-ball to win.',
  howToPlay: '10-Ball Pool is a real, dice-driven simulation. 10-Ball Pool: pocket balls in order; sink the 10-ball to win.\\n\\nPress Roll to take your turn. Each round resolves immediately and the running score updates after every roll. Press Next to advance until the match ends.\\n\\nGame state is fully seeded for replay parity, and the log strip shows your most recent rolls.',
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as Pool10ballSettings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-pool-10ball-action"]', pulses: 3 }; },
  component: Pool10ballGame,
};
