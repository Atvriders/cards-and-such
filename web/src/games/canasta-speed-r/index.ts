import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GState, GAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const CanastaSpeedRGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.CanastaSpeedRGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const canastaSpeedRPlugin: GamePlugin<GState, GAction, typeof settings> = {
  id: "canasta-speed-r", title: "Canasta Speed", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Time-limited Canasta with abbreviated three-round play.",
  howToPlay: "Canasta Speed compresses the canasta experience into just three quick rounds, perfect for a fast match. Eleven cards are dealt each round and the engine instantly auto-melds them into the best sets and runs available.\n\nA set is three or more cards of the same rank; a run is three or more consecutive cards of one suit. Each meld scores twenty base points plus five for each extra card past the third. Deadwood — leftover unmelded cards — adds aces at one, face cards at ten, others at face value, but contributes only minor consolation when you have no melds at all.\n\nGoing out clean (no deadwood) adds a twenty-five-point Canasta-out bonus. Across three rounds, expected totals range from forty to one hundred forty depending on how the deck cooperates. Click 'Auto-score' to lock the round and 'Next' to advance. Speed favors decisive seeds where ranks cluster and suits bunch — three rounds is just enough rhythm to feel the meld pressure.",
  settings,
  initialState: (seed: number, _s: S) => initialState(seed, { dummy: false }),
  reducer, isTerminal, 
  hint: (state: GState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (state.phase === "play") return { selector: '[data-testid="hint-target-canasta-speed-r-play"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-canasta-speed-r-next"]', pulses: 3 };
    return null;
  },
  component: CanastaSpeedRGame,
};
