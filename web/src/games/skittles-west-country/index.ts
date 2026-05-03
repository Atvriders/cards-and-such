import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { SkittlesWestCountryState, SkittlesWestCountryAction, SkittlesWestCountrySettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const SkittlesWestCountryGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.SkittlesWestCountryGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"Standard rules", default:true } } as const;
type S = SettingsOf<typeof settings>;

export const skittlesWestCountryPlugin: GamePlugin<SkittlesWestCountryState, SkittlesWestCountryAction, typeof settings> = {
  id: "skittles-west-country",
  title: "West Country Skittles",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: 'West Country Skittles: 2-die rolls = pins; classic strike/spare scoring across 8 frames.',
  howToPlay: 'West Country Skittles is a real, dice-driven simulation. West Country Skittles: 2-die rolls = pins; classic strike/spare scoring across 8 frames.\\n\\nPress Roll to take your turn. Each round resolves immediately and the running score updates after every roll. Press Next to advance until the match ends.\\n\\nGame state is fully seeded for replay parity, and the log strip shows your most recent rolls.',
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SkittlesWestCountrySettings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-skittles-west-country-action"]', pulses: 3 }; },
  component: SkittlesWestCountryGame,
};
