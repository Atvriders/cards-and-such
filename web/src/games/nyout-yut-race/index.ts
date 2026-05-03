import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { NyoutState, NyoutAction, NyoutSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const NyoutGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.NyoutGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const nyoutYutRacePlugin: GamePlugin<NyoutState, NyoutAction, typeof settings> = {
  id: "nyout-yut-race",
  title: "Nyout (Yut Nori) Race",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Korean cross-and-circle race; four pieces around the track.",
  howToPlay: "Nyout (Yut Nori) is Korea's traditional New Year race game; here you advance four pieces using two virtual sticks-dice. In this lightweight single-player edition you race against a random CPU opponent. On your turn you roll two six-sided dice. You may move any checker forward by one die value, or by both dice combined. Click the matching button on a checker to commit the move. Once both dice are spent your turn ends and the CPU rolls. The board shows a horizontal track of 20 points; player tokens are red and CPU tokens are dark. Each side starts with 4 checkers at point zero. The first side to push every checker past the final point wins the match. Scoring rewards a win heavily: a victory grants 100 points plus a pip-count bonus equal to how far ahead of your opponent you finish. A loss scores 0. The CPU plays random legal moves, so a little planning gives you a real edge. Run your back checkers first, then bear off as fast as you can.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as NyoutSettings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "done" || p === "gameover" || p === "ended" || p === "finished" || (s as any).gameOver || (s as any).won || (s as any).complete || (s as any).isComplete) return null; return { selector: ".nyout-btn", pulses: 3 }; },
  component: NyoutGame,
};
