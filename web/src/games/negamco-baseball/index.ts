import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { NegamcoBaseballState, NegamcoBaseballAction, NegamcoBaseballSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const NegamcoBaseballGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.NegamcoBaseballGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"Standard rules", default:true } } as const;
type S = SettingsOf<typeof settings>;

export const negamcoBaseballPlugin: GamePlugin<NegamcoBaseballState, NegamcoBaseballAction, typeof settings> = {
  id: "negamco-baseball",
  title: "Negamco Baseball",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: 'Negamco Baseball: play 9 innings of dice-driven at-bats. Outscore the CPU.',
  howToPlay: 'Negamco Baseball is a real, dice-driven simulation. Negamco Baseball: play 9 innings of dice-driven at-bats. Outscore the CPU.\\n\\nPress Roll to take your turn. Each round resolves immediately and the running score updates after every roll. Press Next to advance until the match ends.\\n\\nGame state is fully seeded for replay parity, and the log strip shows your most recent rolls.',
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as NegamcoBaseballSettings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-negamco-baseball-action"]', pulses: 3 }; },
  component: NegamcoBaseballGame,
};
