import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { DartsBaseballClassicState, DartsBaseballClassicAction, DartsBaseballClassicSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const DartsBaseballClassicGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.DartsBaseballClassicGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"Standard rules", default:true } } as const;
type S = SettingsOf<typeof settings>;

export const dartsBaseballClassicPlugin: GamePlugin<DartsBaseballClassicState, DartsBaseballClassicAction, typeof settings> = {
  id: "darts-baseball-classic",
  title: "Classic Baseball Darts",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: 'Baseball darts: 9 innings; score runs on hits in the assigned number.',
  howToPlay: 'Classic Baseball Darts is a real, dice-driven simulation. Baseball darts: 9 innings; score runs on hits in the assigned number.\\n\\nPress Roll to take your turn. Each round resolves immediately and the running score updates after every roll. Press Next to advance until the match ends.\\n\\nGame state is fully seeded for replay parity, and the log strip shows your most recent rolls.',
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as DartsBaseballClassicSettings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-darts-baseball-classic-action"]', pulses: 3 }; },
  component: DartsBaseballClassicGame,
};
