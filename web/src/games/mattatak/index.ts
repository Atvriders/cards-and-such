import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MattatakState, MattatakAction, MattatakSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const MattatakGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.MattatakGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const mattatakPlugin: GamePlugin<MattatakState, MattatakAction, typeof settings> = {
  id: "mattatak", title: "Mattatak", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Korean flower-card variant: capture rounds against CPU.",
  howToPlay: "Mattatak is a Korean flower-card variant played with the Hwatu deck (the Korean cousin of Hanafuda). This mini-version reduces the game to a 9-round capture-comparison race against the CPU, using standard playing cards for accessibility.\n\nEach round, you and the CPU each draw one card. Higher rank wins (a \"mat!\"). Aces high (13), twos low (1). Suit is ignored.\n\nScoring: round win awards 11 points. Tie awards 4 sympathy points. Loss awards zero.\n\nNine rounds total. Expected score: 50-70 points; lucky runs cross 80.\n\nReal Mattatak involves a Hwatu deck of 48 month-themed cards and complex paired-capture rules. Korean Hwatu games tend to be intense, fast, and gambling-friendly — Mattatak is no exception. This mini distills the energy without the deck or the rules. A quick gateway into the broader Korean card-game tradition for players who only know Western 52-card games.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as MattatakSettings),
  reducer, isTerminal, hint: (state: MattatakState): HintTarget | null => (state.phase === "ready" ? { selector: '[data-testid="hint-target-mattatak-primary"]', pulses: 3 } : null), component: MattatakGame,
};
