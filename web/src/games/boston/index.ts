import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BostonState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const Boston = /* @__PURE__ */ lazy(() => import("./Boston.js").then((mod) => ({ default: mod.Boston as unknown as React.ComponentType<unknown> })));
const bostonSettings = {
  botDifficulty: {
    kind: "enum" as const,
    label: "Bots",
    options: ["easy", "hard"] as const,
    default: "hard" as const,
  },
} as const;

type BostonSettingsType = SettingsOf<typeof bostonSettings>;

type BostonAction =
  | { type: "bid"; amount: number }
  | { type: "play"; cardId: string };

export const bostonPlugin: GamePlugin<BostonState, BostonAction, typeof bostonSettings> = {
  id: "boston",
  title: "Boston Whist",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Historic 4-player bidding game from 18th-century America — bid your tricks and go it alone!",
  howToPlay: `Boston Whist was one of the most fashionable card games in 18th and 19th-century America and France, a favourite of Benjamin Franklin and the Continental Army officers.

Each player receives 13 cards from a standard 52-card deck. A trump suit is determined by cutting the remaining card. You play alone against three bots.

Bidding: You name how many tricks (1 to 13) you intend to win by yourself. The higher your bid, the greater the risk and reward.

Play: You lead first. Players must follow the led suit if possible. If unable to follow, any card may be played including trump. Highest trump wins; if no trump, highest card of the led suit wins.

Scoring: If you take at least as many tricks as you bid, you score that many points. If you fall short, the bots score those points instead. Bidding exactly 13 tricks (a "Boston") is the supreme achievement.

Choose your bid wisely — count your trumps and high cards before committing!`,
  settings: bostonSettings,
  initialState: (seed: number, settings: BostonSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: BostonState): HintTarget | null => {
    if (isTerminal(state)) return null;
    return { selector: '[data-testid="hint-target-boston-primary"]', pulses: 3 };
  },
  component: Boston,
};
