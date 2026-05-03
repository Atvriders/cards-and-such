import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { HokmState } from "./state.js";
import type { Suit } from "../../engines/deck/index.js";
import { initialState, reducer, isTerminal } from "./state.js";
const Hokm = /* @__PURE__ */ lazy(() => import("./Hokm.js").then((mod) => ({ default: mod.Hokm as unknown as React.ComponentType<unknown> })));
const hokmSettings = {
  botDifficulty: {
    kind: "enum" as const,
    label: "Bots",
    options: ["easy", "hard"] as const,
    default: "hard" as const,
  },
} as const;

type HokmSettingsType = SettingsOf<typeof hokmSettings>;
type HokmAction =
  | { type: "chooseTrump"; suit: Suit }
  | { type: "play"; cardId: string };

export const hokmPlugin: GamePlugin<HokmState, HokmAction, typeof hokmSettings> = {
  id: "hokm",
  title: "Hokm",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Persian 4-player partnership trick-taking game where the Hakem chooses trump.",
  howToPlay: `Hokm (also spelled Hukm) is the national card game of Iran. Played 4-player in two teams of two — you and Bot 2 vs Bot 1 and Bot 3 — with partners sitting opposite each other.

The Hakem: One player is designated Hakem (master). In this version, you are always the Hakem. After seeing your full 13-card hand, you choose the trump suit that best fits your hand.

Play: All 52 cards are dealt (13 each). The Hakem leads the first trick. Standard trick-taking rules apply: players must follow the led suit if possible. If unable to follow suit, they may play trump or any other card. The highest trump wins; if no trump, highest of the led suit wins.

Scoring: The team that wins 7 or more of the 13 tricks wins the round and scores 1 point. Partners signal strength through their card choices — play low when your partner leads, saving your high cards to capture opponent tricks.

Strategy: As Hakem, choose a trump suit you hold several high cards in. During play, lead your best trump early to draw out opponents' trumps, then cash side-suit winners.

Click a suit symbol to choose trump, then click cards to play.`,
  settings: hokmSettings,
  initialState: (seed: number, settings: HokmSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: HokmState): HintTarget | null => {
    if (isTerminal(state)) return null;
    return { selector: '[data-testid="hint-target-hokm-primary"]', pulses: 3 };
  },
  component: Hokm,
};
