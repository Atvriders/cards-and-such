import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { PoolBankState, PoolBankAction, PoolBankSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const PoolBankGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.PoolBankGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"Standard rules", default:true } } as const;
type S = SettingsOf<typeof settings>;

export const poolBankPlugin: GamePlugin<PoolBankState, PoolBankAction, typeof settings> = {
  id: "pool-bank",
  title: "Bank Pool",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: 'Bank Pool: pocket balls in order; sink the 9-ball to win.',
  howToPlay: 'Bank Pool is a real, dice-driven simulation. Bank Pool: pocket balls in order; sink the 9-ball to win.\\n\\nPress Roll to take your turn. Each round resolves immediately and the running score updates after every roll. Press Next to advance until the match ends.\\n\\nGame state is fully seeded for replay parity, and the log strip shows your most recent rolls.',
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as PoolBankSettings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-pool-bank-action"]', pulses: 3 }; },
  component: PoolBankGame,
};
