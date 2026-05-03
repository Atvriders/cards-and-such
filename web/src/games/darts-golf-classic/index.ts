import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { DartsGolfClassicState, DartsGolfClassicAction, DartsGolfClassicSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const DartsGolfClassicGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.DartsGolfClassicGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"Standard rules", default:true } } as const;
type S = SettingsOf<typeof settings>;

export const dartsGolfClassicPlugin: GamePlugin<DartsGolfClassicState, DartsGolfClassicAction, typeof settings> = {
  id: "darts-golf-classic",
  title: "Classic Golf Darts",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: 'Classic golf darts: 9 holes (numbers 1-9), low score wins.',
  howToPlay: 'Classic Golf Darts is a real, dice-driven simulation. Classic golf darts: 9 holes (numbers 1-9), low score wins.\\n\\nPress Roll to take your turn. Each round resolves immediately and the running score updates after every roll. Press Next to advance until the match ends.\\n\\nGame state is fully seeded for replay parity, and the log strip shows your most recent rolls.',
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as DartsGolfClassicSettings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-darts-golf-classic-action"]', pulses: 3 }; },
  component: DartsGolfClassicGame,
};
