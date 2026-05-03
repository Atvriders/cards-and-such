import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { ApbaBaseballState, ApbaBaseballAction, ApbaBaseballSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const ApbaBaseballGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.ApbaBaseballGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"Standard rules", default:true } } as const;
type S = SettingsOf<typeof settings>;

export const apbaBaseballPlugin: GamePlugin<ApbaBaseballState, ApbaBaseballAction, typeof settings> = {
  id: "apba-baseball",
  title: "APBA Baseball",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: 'APBA Baseball: play 9 innings of dice-driven at-bats. Outscore the CPU.',
  howToPlay: 'APBA Baseball is a real, dice-driven simulation. APBA Baseball: play 9 innings of dice-driven at-bats. Outscore the CPU.\\n\\nPress Roll to take your turn. Each round resolves immediately and the running score updates after every roll. Press Next to advance until the match ends.\\n\\nGame state is fully seeded for replay parity, and the log strip shows your most recent rolls.',
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ApbaBaseballSettings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-apba-baseball-action"]', pulses: 3 }; },
  component: ApbaBaseballGame,
};
