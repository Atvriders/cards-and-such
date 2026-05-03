import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TruelState, TruelAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const Truel = /* @__PURE__ */ lazy(() => import("./Truel.js").then((mod) => ({ default: mod.Truel as unknown as React.ComponentType<unknown> })));
export const truelSettings = {
  rounds: {
    kind: "enum" as const,
    label: "Rounds",
    options: ["1", "3"] as const,
    default: "1",
  },
} as const;

type TruelSettingsType = SettingsOf<typeof truelSettings>;

export const truelPlugin: GamePlugin<TruelState, TruelAction, typeof truelSettings> = {
  id: "truel",
  title: "Truel",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Three-way duel — you are the worst shot. Survive!",
  howToPlay: `A Truel is a three-way duel between shooters A, B, and C. You control A, the weakest shot.

Accuracies: A hits 1 in 3 shots (33%), B hits 1 in 2 (50%), C never misses (100%). The order is A → B → C, cycling until only one shooter survives.

On your turn as A, choose: shoot at B, shoot at C, or deliberately fire into the air. B and C always target the most dangerous remaining opponent (C first, then B).

Classic puzzle insight: A's best opening move is often to shoot into the air. This lets B and C eliminate each other first, leaving A to face a weaker survivor. Shooting C first means B (50% accuracy) will likely kill you next. Shooting B means C (100% accuracy) will certainly kill you.

The game resolves via seeded RNG for probabilistic shots — the same seed always produces the same outcome, so replaying with a different strategy explores different branches.

Scoring: surviving as the last shooter standing scores 100. All other outcomes score 0.

Settings: Rounds 1 or 3 — in 3-round mode you play multiple independent duels and track cumulative wins.`,
  settings: truelSettings,
  initialState: (seed: number, settings: TruelSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver || (s as any).won || (s as any).isWon || (s as any).isComplete || (s as any).complete) return null; return { selector: '[data-testid="hint-target-truel-action"]', pulses: 3 }; },
  component: Truel,
};
