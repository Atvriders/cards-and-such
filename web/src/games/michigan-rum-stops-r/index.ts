import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GState, GAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const MichiganRumStopsRGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.MichiganRumStopsRGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const michiganRumStopsRPlugin: GamePlugin<GState, GAction, typeof settings> = {
  id: "michigan-rum-stops-r", title: "Michigan Rum", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "500 Rum with Michigan stops-style rank scoring.",
  howToPlay: "Michigan Rum is a 500 Rum variant that incorporates 'stops' — special premium ranks that reward big bonuses when captured. This simulator runs five rounds; each deals a seven-card hand which the engine auto-melds into the best sets and runs.\n\nA set is three or more cards of the same rank; a run is three or more consecutive same-suit cards. Each meld scores twenty base points plus five for every card past three. Cards outside melds form deadwood — aces one, face cards ten, others pip value — yielding only a small consolation when no melds form.\n\nGoing out clean (zero deadwood) adds the twenty-five-point Michigan stops bonus, simulating the premium-card capture reward. Across five rounds, expected totals run fifty to one-fifty. Click 'Auto-score' to evaluate the round and 'Next' to deal again. Michigan Rum rewards seeds where ranks cluster — especially around the high or low end where the strongest melds form — and clean-finish hands feel especially celebratory.",
  settings,
  initialState: (seed: number, _s: S) => initialState(seed, { dummy: false }),
  reducer, isTerminal, 
  hint: (state: GState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (state.phase === "play") return { selector: '[data-testid="hint-target-michigan-rum-stops-r-play"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-michigan-rum-stops-r-next"]', pulses: 3 };
    return null;
  },
  component: MichiganRumStopsRGame,
};
