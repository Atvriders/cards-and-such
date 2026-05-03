import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { SkittlesRubberState, SkittlesRubberAction, SkittlesRubberSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const SkittlesRubberGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.SkittlesRubberGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"Standard rules", default:true } } as const;
type S = SettingsOf<typeof settings>;

export const skittlesRubberPlugin: GamePlugin<SkittlesRubberState, SkittlesRubberAction, typeof settings> = {
  id: "skittles-rubber",
  title: "Rubber Skittles",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: 'Rubber Skittles: 2-die rolls = pins; classic strike/spare scoring across 12 frames.',
  howToPlay: 'Rubber Skittles is a real, dice-driven simulation. Rubber Skittles: 2-die rolls = pins; classic strike/spare scoring across 12 frames.\\n\\nPress Roll to take your turn. Each round resolves immediately and the running score updates after every roll. Press Next to advance until the match ends.\\n\\nGame state is fully seeded for replay parity, and the log strip shows your most recent rolls.',
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SkittlesRubberSettings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-skittles-rubber-action"]', pulses: 3 }; },
  component: SkittlesRubberGame,
};
