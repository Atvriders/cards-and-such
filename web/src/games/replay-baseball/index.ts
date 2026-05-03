import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { ReplayBaseballState, ReplayBaseballAction, ReplayBaseballSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const ReplayBaseballGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.ReplayBaseballGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"Standard rules", default:true } } as const;
type S = SettingsOf<typeof settings>;

export const replayBaseballPlugin: GamePlugin<ReplayBaseballState, ReplayBaseballAction, typeof settings> = {
  id: "replay-baseball",
  title: "Replay Baseball",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: 'Replay Baseball: play 9 innings of dice-driven at-bats. Outscore the CPU.',
  howToPlay: 'Replay Baseball is a real, dice-driven simulation. Replay Baseball: play 9 innings of dice-driven at-bats. Outscore the CPU.\\n\\nPress Roll to take your turn. Each round resolves immediately and the running score updates after every roll. Press Next to advance until the match ends.\\n\\nGame state is fully seeded for replay parity, and the log strip shows your most recent rolls.',
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ReplayBaseballSettings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-replay-baseball-action"]', pulses: 3 }; },
  component: ReplayBaseballGame,
};
