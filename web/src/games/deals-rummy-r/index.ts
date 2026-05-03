import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GState, GAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const DealsRummyRGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.DealsRummyRGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const dealsRummyRPlugin: GamePlugin<GState, GAction, typeof settings> = {
  id: "deals-rummy-r", title: "Deals Rummy", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Indian Rummy variant with a fixed number of deals.",
  howToPlay: "Deals Rummy is the Indian Rummy format where a fixed number of deals is agreed upon at the start, and the highest cumulative score wins. This simulator runs four deals — each a fresh nine-card hand which the engine auto-melds into the best sets and runs.\n\nA set is three or more cards of the same rank; a run is three or more consecutive same-suit cards. Each meld scores twenty base points plus five for every card past three. Cards remaining outside any meld form deadwood — aces one, face cards ten, others pip value — and bare-hand rounds get only a small consolation.\n\nGoing out — emptying your hand entirely — adds a twenty-five-point bonus. Across four deals, expected totals run forty-five to one-thirty. Click 'Auto-score' to lock each hand and 'Next' to deal again. Deals Rummy is brisk and decisive: with only four shots, a single good seed can dominate, while a slow start has only a few chances to recover.",
  settings,
  initialState: (seed: number, _s: S) => initialState(seed, { dummy: false }),
  reducer, isTerminal, 
  hint: (state: GState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (state.phase === "play") return { selector: '[data-testid="hint-target-deals-rummy-r-play"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-deals-rummy-r-next"]', pulses: 3 };
    return null;
  },
  component: DealsRummyRGame,
};
