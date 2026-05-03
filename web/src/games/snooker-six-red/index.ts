import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { SnookerSixRedState, SnookerSixRedAction, SnookerSixRedSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const SnookerSixRedGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.SnookerSixRedGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"Standard rules", default:true } } as const;
type S = SettingsOf<typeof settings>;

export const snookerSixRedPlugin: GamePlugin<SnookerSixRedState, SnookerSixRedAction, typeof settings> = {
  id: "snooker-six-red",
  title: "Snooker Six Red",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: 'Snooker Six Red: pot reds and colours in sequence to build a break.',
  howToPlay: 'Snooker Six Red is a real, dice-driven simulation. Snooker Six Red: pot reds and colours in sequence to build a break.\\n\\nPress Roll to take your turn. Each round resolves immediately and the running score updates after every roll. Press Next to advance until the match ends.\\n\\nGame state is fully seeded for replay parity, and the log strip shows your most recent rolls.',
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SnookerSixRedSettings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-snooker-six-red-action"]', pulses: 3 }; },
  component: SnookerSixRedGame,
};
