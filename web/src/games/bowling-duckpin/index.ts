import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { BowlingDuckpinState, BowlingDuckpinAction, BowlingDuckpinSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const BowlingDuckpinGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.BowlingDuckpinGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"Standard rules", default:true } } as const;
type S = SettingsOf<typeof settings>;

export const bowlingDuckpinPlugin: GamePlugin<BowlingDuckpinState, BowlingDuckpinAction, typeof settings> = {
  id: "bowling-duckpin",
  title: "Duckpin Bowling",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: 'Duckpin Bowling: 2-die rolls = pins; classic strike/spare scoring across 10 frames.',
  howToPlay: 'Duckpin Bowling is a real, dice-driven simulation. Duckpin Bowling: 2-die rolls = pins; classic strike/spare scoring across 10 frames.\\n\\nPress Roll to take your turn. Each round resolves immediately and the running score updates after every roll. Press Next to advance until the match ends.\\n\\nGame state is fully seeded for replay parity, and the log strip shows your most recent rolls.',
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as BowlingDuckpinSettings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-bowling-duckpin-action"]', pulses: 3 }; },
  component: BowlingDuckpinGame,
};
