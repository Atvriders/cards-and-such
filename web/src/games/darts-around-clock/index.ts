import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { DartsAroundClockState, DartsAroundClockAction, DartsAroundClockSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const DartsAroundClockGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.DartsAroundClockGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"Standard rules", default:true } } as const;
type S = SettingsOf<typeof settings>;

export const dartsAroundClockPlugin: GamePlugin<DartsAroundClockState, DartsAroundClockAction, typeof settings> = {
  id: "darts-around-clock",
  title: "Classic Around the Clock",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: 'Classic Around the Clock: hit 1 through 20 in order, then bullseye.',
  howToPlay: 'Classic Around the Clock is a real, dice-driven simulation. Classic Around the Clock: hit 1 through 20 in order, then bullseye.\\n\\nPress Roll to take your turn. Each round resolves immediately and the running score updates after every roll. Press Next to advance until the match ends.\\n\\nGame state is fully seeded for replay parity, and the log strip shows your most recent rolls.',
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as DartsAroundClockSettings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-darts-around-clock-action"]', pulses: 3 }; },
  component: DartsAroundClockGame,
};
