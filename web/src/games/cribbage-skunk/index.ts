import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { CribbageSkunkState, CribbageSkunkAction, CribbageSkunkSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const CribbageSkunkGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.CribbageSkunkGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"Standard rules", default:true } } as const;
type S = SettingsOf<typeof settings>;

export const cribbageSkunkPlugin: GamePlugin<CribbageSkunkState, CribbageSkunkAction, typeof settings> = {
  id: "cribbage-skunk",
  title: "Cribbage Skunk",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: 'Cribbage Skunk: peg from 0 to 121 with hand scores (15s, pairs, runs, flushes, knobs).',
  howToPlay: 'Cribbage Skunk is a real, dice-driven simulation. Cribbage Skunk: peg from 0 to 121 with hand scores (15s, pairs, runs, flushes, knobs).\\n\\nPress Roll to take your turn. Each round resolves immediately and the running score updates after every roll. Press Next to advance until the match ends.\\n\\nGame state is fully seeded for replay parity, and the log strip shows your most recent rolls.',
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as CribbageSkunkSettings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-cribbage-skunk-action"]', pulses: 3 }; },
  component: CribbageSkunkGame,
};
