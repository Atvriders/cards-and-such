import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { EscobaMiniState, EscobaMiniAction, EscobaMiniSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const EscobaMiniGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.EscobaMiniGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const escobaMiniPlugin: GamePlugin<EscobaMiniState, EscobaMiniAction, typeof settings> = {
  id: "escoba-mini", title: "Escoba Mini", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Spanish Scopa: capture-to-15 with broom-sweep bonus.",
  howToPlay: "Escoba is the Spanish Scopa variant — escoba means \"broom\" and refers to the dramatic table-sweep that defines the game. The capture rule is identical to Scopa di 15 (sum to exactly 15), but Spanish flavor and high-stakes play. This mini compresses it into eight broom-sweeps.\n\nEach round, you and the CPU each draw one card. Higher rank wins (a successful sweep!). Aces high (13), twos low (1). Suit is irrelevant.\n\nScoring: round win (escoba!) awards 15 points. Tie awards 5 sympathy points. Loss awards zero.\n\nEight rounds total. Expected score: 60-80 points.\n\nReal Escoba uses a 40-card Spanish deck (Oro, Copa, Espada, Basto suits) and the sum-to-15 capture works exactly as in Italian Scopa di 15. This mini ignores the suit-flavor and the deck-difference — just clean, fast captures. The name comes from the broom-clean visual when a player captures all table cards in one play. A quick taste of Iberian capture-game energy.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as EscobaMiniSettings),
  reducer, isTerminal, hint: (state: EscobaMiniState): HintTarget | null => (state.phase === "ready" ? { selector: '[data-testid="hint-target-escoba-mini-primary"]', pulses: 3 } : null), component: EscobaMiniGame,
};
