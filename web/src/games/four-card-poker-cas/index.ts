import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { FourCardPokerCasState, FourCardPokerCasAction, FourCardPokerCasSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const FourCardPokerCasGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.FourCardPokerCasGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
const hint = (state: FourCardPokerCasState): HintTarget | null => {
  if (isTerminal(state)) return null;
  if (state.phase === "ready") return { selector: '[data-testid="hint-target-four-card-poker-cas-primary"]', pulses: 3 };
  if (state.phase === "scored") return { selector: '[data-testid="hint-target-four-card-poker-cas-secondary"]', pulses: 3 };
  return null;
};
export const fourCardPokerCasPlugin: GamePlugin<FourCardPokerCasState, FourCardPokerCasAction, typeof settings> = {
  id: "four-card-poker-cas", title: "Four Card Poker (Casino)", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Four-card variant of Three Card Poker.",
  howToPlay: "Four Card Poker is a casino table game where the player makes the best four-card poker hand from five dealt cards and competes against the dealer's four-card hand from six. Hand rankings include four-of-a-kind, straight flush, three-of-a-kind, etc.\n\nIn this single-player version you play fifteen rounds. Press Play each round to deal five cards to you and six to the dealer. Each side selects their best four-card hand. Compare and pay.\n\nKey payouts: high card pays even; pair pays even; two pair pays even; trips pay one bonus; straight pays two; flush pays three; straight flush pays twenty-five; four of a kind pays fifty.\n\nA strong total across fifteen rounds is around two hundred. The dealer always qualifies, so there is no qualifying-edge to worry about. The house edge with optimal play is roughly 2.8%.\n\nFour Card Poker was invented by Roger Snow and licensed by Shuffle Master in 2003. The Aces Up and Pair Plus side bets are omitted here. Press Play to deal.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as FourCardPokerCasSettings),
  reducer, isTerminal, hint: hint, component: FourCardPokerCasGame,
};
