import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { HymnCountState, HymnCountAction, HymnCountSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const HymnCountGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.HymnCountGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const hymnCountPlugin: GamePlugin<HymnCountState, HymnCountAction, typeof settings> = {
  id: "hymn-count", title: "Hymn Count", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Memory variant: count cards seen, beat CPU's hymn-deck count.",
  howToPlay: "Hymn Count is a card-counting memory variant where players track a running number-of-times-seen tally. This mini-version interprets it as a per-round comparison: each round, you \"sing\" a card from the deck and the CPU does too — higher rank wins.\n\nEach round, a card is drawn for you and another for the CPU. Higher rank wins outright. Aces (13) are high, twos (1) low. Suit doesn't matter.\n\nScoring: round win awards 10 points. Tie awards 4 sympathy points. Loss awards zero.\n\nTen rounds total. Expected score is around 45-65 points; lucky runs push past 75.\n\nHymn Count's traditional rule was that the highest count of repeated ranks across players' visible piles wins the hand. The \"hymn\" name evokes the steady rhythm of counting through the deck like reciting verse. This mini version preserves the steady tick of comparing cards round after round without any real running tally to remember. Calm, repetitive, oddly meditative.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as HymnCountSettings),
  reducer, isTerminal, hint: (state: HymnCountState): HintTarget | null => (state.phase === "ready" ? { selector: '[data-testid="hint-target-hymn-count-primary"]', pulses: 3 } : null), component: HymnCountGame,
};
