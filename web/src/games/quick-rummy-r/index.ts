import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GState, GAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const QuickRummyRGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.QuickRummyRGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const quickRummyRPlugin: GamePlugin<GState, GAction, typeof settings> = {
  id: "quick-rummy-r", title: "Quick Rummy", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Short-form single-deal rummy ideal for fast matches.",
  howToPlay: "Quick Rummy is a deliberately short rummy session — just two rounds — for when you want a fast meld-and-score warmup. Each round you receive a seven-card hand and the engine auto-melds the best sets and runs.\n\nSets need three or more matching ranks; runs need three or more consecutive same-suit cards. Each meld scores twenty base points plus five for every card past three. Cards left over form deadwood and contribute only a small consolation when no melds form. Going out — emptying your hand entirely after melding — adds twenty-five-point bonus.\n\nWith only two rounds, expected totals range twenty to seventy. The variance is high: a single great hand can dominate the score, so quick games feel decisive. Click 'Auto-score' to lock a round and 'Next' to deal again. Quick Rummy is perfect for testing a seed, learning the auto-meld engine's behavior, or grabbing a five-second card-game break.",
  settings,
  initialState: (seed: number, _s: S) => initialState(seed, { dummy: false }),
  reducer, isTerminal, 
  hint: (state: GState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (state.phase === "play") return { selector: '[data-testid="hint-target-quick-rummy-r-play"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-quick-rummy-r-next"]', pulses: 3 };
    return null;
  },
  component: QuickRummyRGame,
};
