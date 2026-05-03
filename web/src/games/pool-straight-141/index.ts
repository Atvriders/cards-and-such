import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { PoolStraight141State, PoolStraight141Action, PoolStraight141Settings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const PoolStraight141Game = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.PoolStraight141Game as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"Standard rules", default:true } } as const;
type S = SettingsOf<typeof settings>;

export const poolStraight141Plugin: GamePlugin<PoolStraight141State, PoolStraight141Action, typeof settings> = {
  id: "pool-straight-141",
  title: "Straight Pool 141",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: 'Straight Pool 141: pocket balls in order; sink the 15-ball to win.',
  howToPlay: 'Straight Pool 141 is a real, dice-driven simulation. Straight Pool 141: pocket balls in order; sink the 15-ball to win.\\n\\nPress Roll to take your turn. Each round resolves immediately and the running score updates after every roll. Press Next to advance until the match ends.\\n\\nGame state is fully seeded for replay parity, and the log strip shows your most recent rolls.',
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as PoolStraight141Settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-pool-straight-141-action"]', pulses: 3 }; },
  component: PoolStraight141Game,
};
