import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { OhHellState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const OhHell = /* @__PURE__ */ lazy(() => import("./OhHell.js").then((mod) => ({ default: mod.OhHell as unknown as React.ComponentType<unknown> })));
const ohHellSettings = {
  botDifficulty: {
    kind: "enum" as const,
    label: "Bots",
    options: ["easy", "hard"] as const,
    default: "hard" as const,
  },
} as const;

type OhHellSettingsType = SettingsOf<typeof ohHellSettings>;

type OhHellAction =
  | { type: "bid"; amount: number }
  | { type: "play"; cardId: string };

export const ohHellPlugin: GamePlugin<OhHellState, OhHellAction, typeof ohHellSettings> = {
  id: "oh-hell",
  title: "Oh Hell",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Exact-bid trick-taking game. Hit your bid precisely to score; miss and lose points.",
  howToPlay: `Oh Hell (also called Blackout or Whist in some regions) is a trick-taking card game where precision matters more than winning the most tricks.

Each player is dealt 7 cards. A trump card is flipped to determine the trump suit. Before play, each player must bid the exact number of tricks they intend to win — no more, no less.

Scoring: If you take exactly as many tricks as you bid, you earn 10 + bid points. If you miss your bid by any amount, you lose points equal to how far off you were.

Play: You lead the first trick. Players must follow the led suit if they can. If unable to follow, they may play any card including trump. The highest trump wins; if no trump is played, the highest card of the led suit wins.

Strategy: Exact bidding is key. Count your trump cards and high cards carefully. Sometimes it's better to intentionally duck a trick to stay on target. Bots will bid and play to hit their own targets.

Click a number to make your bid. Then click cards to play them — legal plays are highlighted.`,
  settings: ohHellSettings,
  initialState: (seed: number, settings: OhHellSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: OhHellState): HintTarget | null => {
    if (isTerminal(state)) return null;
    return { selector: '[data-testid="hint-target-oh-hell-primary"]', pulses: 3 };
  },
  component: OhHell,
};
