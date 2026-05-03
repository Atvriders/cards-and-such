import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { NinepinsClassicState, NinepinsClassicAction, NinepinsClassicSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const NinepinsClassicGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.NinepinsClassicGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"Standard rules", default:true } } as const;
type S = SettingsOf<typeof settings>;

export const ninepinsClassicPlugin: GamePlugin<NinepinsClassicState, NinepinsClassicAction, typeof settings> = {
  id: "ninepins-classic",
  title: "Classic Ninepins",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: 'Classic Ninepins: 2-die rolls = pins; classic strike/spare scoring across 9 frames.',
  howToPlay: 'Classic Ninepins is a real, dice-driven simulation. Classic Ninepins: 2-die rolls = pins; classic strike/spare scoring across 9 frames.\\n\\nPress Roll to take your turn. Each round resolves immediately and the running score updates after every roll. Press Next to advance until the match ends.\\n\\nGame state is fully seeded for replay parity, and the log strip shows your most recent rolls.',
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as NinepinsClassicSettings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-ninepins-classic-action"]', pulses: 3 }; },
  component: NinepinsClassicGame,
};
