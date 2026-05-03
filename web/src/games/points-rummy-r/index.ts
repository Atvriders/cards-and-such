import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GState, GAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const PointsRummyRGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.PointsRummyRGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const pointsRummyRPlugin: GamePlugin<GState, GAction, typeof settings> = {
  id: "points-rummy-r", title: "Points Rummy", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Single-deal Indian rummy speed variant.",
  howToPlay: "Points Rummy is the speediest format of Indian Rummy: a single deal where the score from one hand becomes the final result. In this simulator, you receive a nine-card hand which the engine immediately auto-melds into the best available sets and runs.\n\nA set is three or more cards of the same rank; a run is three or more consecutive same-suit cards. Each meld scores twenty base points plus five for every card past three. Deadwood — leftover unmelded cards — contributes pip values (aces one, face cards ten, others face) but here only matters for the small consolation when no melds form.\n\nGoing out (zero deadwood) adds twenty-five-point bonus. Because there is just one deal, expected scores range zero to ninety with high variance. Click 'Auto-score' to evaluate, then the round ends. Points Rummy is the ultimate seed test: lucky deals produce big numbers, while scattered hands score near zero. Perfect for fast comparisons or quick warmups.",
  settings,
  initialState: (seed: number, _s: S) => initialState(seed, { dummy: false }),
  reducer, isTerminal, 
  hint: (state: GState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (state.phase === "play") return { selector: '[data-testid="hint-target-points-rummy-r-play"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-points-rummy-r-next"]', pulses: 3 };
    return null;
  },
  component: PointsRummyRGame,
};
