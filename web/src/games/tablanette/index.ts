import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TablanetteState, TablanetteAction, TablanetteSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const TablanetteGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.TablanetteGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
const hint = (state: TablanetteState): HintTarget | null => {
  if (isTerminal(state)) return null;
  if (state.phase === "ready") return { selector: '[data-testid="hint-target-tablanette-primary"]', pulses: 3 };
  if (state.phase === "result") return { selector: '[data-testid="hint-target-tablanette-secondary"]', pulses: 3 };
  return null;
};

export const tablanettePlugin: GamePlugin<TablanetteState, TablanetteAction, typeof settings> = {
  id: "tablanette", title: "Tablanette", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Balkan Casino-like: sweep all CPU cards each round for points.",
  howToPlay: "Tablanette is a Balkan Casino-relative where capturing all the table cards in one move (\"sweeping\") yields a special bonus. This mini-version simulates the sweep-pressure with a higher per-round payout across nine rounds.\n\nEach round, you and the CPU each draw one card. Higher rank wins (a \"sweep!\"). Aces high (13), twos low (1). Suit is irrelevant.\n\nScoring: round win awards 12 points (matching the sweep bonus tradition). Tie awards 4 sympathy points. Loss awards zero.\n\nNine rounds total. Expected score: 50-70 points; lucky runs cross 80.\n\nThe full Tablanette has a layout of table cards, hand cards, and the special rule that capturing every table card in one play scores a sweep — usually 30+ points on a 100-point game. This mini distills the dramatic sweep-or-not rhythm to round-by-round high-cards. Adapted for solo play against the CPU. Try imagining a Sofia or Belgrade tea shop as you play.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as TablanetteSettings),
  reducer, isTerminal, hint: hint, component: TablanetteGame,
};
