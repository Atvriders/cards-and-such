import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ClosedChinesePokerCasState, ClosedChinesePokerCasAction, ClosedChinesePokerCasSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const ClosedChinesePokerCasGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.ClosedChinesePokerCasGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
const hint = (state: ClosedChinesePokerCasState): HintTarget | null => {
  if (isTerminal(state)) return null;
  if (state.phase === "scored") return { selector: '[data-testid="hint-target-closed-chinese-poker-cas-secondary"]', pulses: 3 };
  return null;
};
export const closedChinesePokerCasPlugin: GamePlugin<ClosedChinesePokerCasState, ClosedChinesePokerCasAction, typeof settings> = {
  id: "closed-chinese-poker-cas", title: "Closed Chinese Poker (Casino)", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Casino Chinese Poker variant with hidden hands.",
  howToPlay: "Closed Chinese Poker is a thirteen-card poker variant where players arrange their hands into three settings — five in the back, five in the middle, three in the front — and compare against opponents row-by-row. The 'closed' variant keeps hands hidden until showdown.\n\nIn this single-player casino adaptation you play against the dealer over eight rounds. Each round you receive five cards (a single front-row sample of the larger game) and see the dealer's five. You may play (compare) or fold. The comparison uses sum-of-rank, aces high.\n\nA win pays fourteen points (with a king bonus of three); a tie pays five; a fold or loss pays zero. Eight rounds are played.\n\nExpected score across eight rounds is forty to sixty. The single-row simplification preserves the comparison core: build a strong hand and confront the dealer. Fold weak rounds; play average-or-better. The king bonus is the swing card — keep aces and kings whenever you have them.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ClosedChinesePokerCasSettings),
  reducer, isTerminal, hint: hint, component: ClosedChinesePokerCasGame,
};
