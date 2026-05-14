import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type {
  SevenWondersFullState,
  SevenWondersFullAction,
  SevenWondersFullSettings,
} from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";

const SevenWondersFullGame = /* @__PURE__ */ lazy(() =>
  import("./Game.js").then((mod) => ({
    default: mod.SevenWondersFullGame as unknown as React.ComponentType<unknown>,
  })),
);

const settings = { _dummy: { kind: "boolean" as const, label: "_", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const sevenWondersFullPlugin: GamePlugin<SevenWondersFullState, SevenWondersFullAction, typeof settings> = {
  id: "7-wonders-full",
  title: "7 Wonders (Full)",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Card-drafting civilisation builder across three ages with military combat and seven unique wonders.",
  howToPlay:
    "Four civilisations (You + 3 CPUs) compete across three Ages. Each Age you are dealt 7 cards; on each round you pick one and pass the rest to a neighbour. Cards are colour-coded: Brown raw resources, Grey manufactured goods, Yellow commerce, Red military shields, Blue civilian VP, Green science (3 symbols), and Purple guilds (Age III only).\n\nOn your turn you may BUILD the card (pay its production cost — your brown/grey cards count as production, and missing units may be auto-traded with neighbours at 2 coins per unit), CONSTRUCT the next stage of your Wonder (the card is consumed and pays the stage's flat cost), or DISCARD it for 3 coins. Hands rotate left in Ages I and III, right in Age II.\n\nAfter each Age, military combat resolves: each player compares their shield total to both neighbours, gaining 1/3/5 VP per victory by Age and -1 per defeat. After Age III, final scoring sums: civilian VP, science set-bonuses (n² per symbol + 7 per matched set), commerce VP, guild VP, wonder VP, military, and treasury (1 VP per 3 coins).\n\nAdvanced rules omitted for this scaffold: neighbour-trading negotiation (auto-resolved at 2 coins/unit), chain construction (free-build via prerequisite cards), guild scoring of neighbours' tableaux, and the very-last-card discard rule (we play all 7 cards each Age).",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as unknown as SevenWondersFullSettings),
  reducer,
  isTerminal,
  hint: (state): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "playing") {
      // Suggest the first card in the human's hand.
      return { selector: '[data-testid="swf-card-0"]', pulses: 3 };
    }
    if (state.phase === "military") return { selector: '[data-testid="swf-resolve-military"]', pulses: 3 };
    if (state.phase === "scoring") return { selector: '[data-testid="swf-final"]', pulses: 3 };
    return null;
  },
  component: SevenWondersFullGame,
};
