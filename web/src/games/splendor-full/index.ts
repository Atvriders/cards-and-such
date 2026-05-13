import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { SplendorFullState, Action, SplendorFullSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";

const SplendorFullGame = /* @__PURE__ */ lazy(() =>
  import("./Game.js").then((mod) => ({
    default: mod.SplendorFullGame as unknown as React.ComponentType<unknown>,
  }))
);

const settings = {
  _dummy: { kind: "boolean" as const, label: "Placeholder", default: false },
} as const;

type S = SettingsOf<typeof settings>;

export const splendorFullPlugin: GamePlugin<SplendorFullState, Action, typeof settings> = {
  id: "splendor-full",
  title: "Splendor (Full)",
  category: "board",
  players: { min: 4, max: 4, multiplayer: false },
  description:
    "Race to 15 prestige points by buying gem-card developments; claim noble visits for bonus prestige.",
  howToPlay:
    "Splendor is a 1-vs-3-CPU engine-building game. On your turn pick one action: (1) take 3 different-colored gem tokens from the bank, (2) take 2 same-colored tokens if its pile has at least 4 left, (3) reserve a face-up card (you also gain 1 gold/wildcard token, max 3 reserved), or (4) buy a face-up or reserved card by paying its cost in tokens and permanent gems (your previously bought cards). Each card you buy gives you 1 permanent gem (a discount on future purchases) plus any prestige points printed on the card. After you buy a card, if your permanent gem mix matches a noble's requirement, that noble visits you for +3 prestige. Three nobles are dealt each game; each visits only one player. When any player first reaches 15 prestige, the round is completed (so seats that haven't acted in this round still get a final turn) and then the player with the most prestige wins (ties go to fewer cards bought). Hand limit: you may never end your turn holding more than 10 tokens — excess is auto-returned to the bank. Strategy: cheap Tier-1 cards convert tokens into permanent discounts; align your color portfolio with the visible nobles for free prestige; reserve a Tier-3 card to lock in a future big-prestige buy.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SplendorFullSettings),
  reducer,
  isTerminal,
  hint: (state) => {
    if (isTerminal(state)) return null;
    if (state.players[state.current]?.isCPU) {
      return { selector: '[data-testid="splendor-full-cpu-step"]', pulses: 3 };
    }
    // Prefer pulse on the first affordable buy if any
    return { selector: '[data-testid^="splendor-full-buy-"]', pulses: 3 };
  },
  component: SplendorFullGame,
};
