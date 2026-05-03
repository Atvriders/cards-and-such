import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { NinetyNineState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const NinetyNine = /* @__PURE__ */ lazy(() => import("./NinetyNine.js").then((mod) => ({ default: mod.NinetyNine as unknown as React.ComponentType<unknown> })));
export const ninetyNineSettings = {
  botDifficulty: {
    kind: "enum" as const,
    label: "Bot Difficulty",
    options: ["easy", "standard"] as const,
    default: "standard" as const,
  },
} as const;

type NinetyNineSettingsType = SettingsOf<typeof ninetyNineSettings>;
type NinetyNineAction =
  | { type: "putDown"; cardIds: [string, string, string] }
  | { type: "play"; cardId: string };

export const ninetyNinePlugin: GamePlugin<NinetyNineState, NinetyNineAction, typeof ninetyNineSettings> = {
  id: "ninety-nine",
  title: "Ninety-Nine",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "3-player trick-taking where your bid is hidden in the cards you set aside.",
  howToPlay: `Ninety-Nine is a clever 3-player trick-taking game where your bid is secretly encoded in the three cards you put face-down before play begins.

Setup: 12 cards are dealt to each of the 3 players. Hearts are always trump.

Bidding: Before play begins, each player selects exactly 3 cards from their hand to place face-down. These cards are NOT played — they are your secret bid. The suit of each put-down card encodes a number: Club = 3, Heart = 2, Spade = 1, Diamond = 0. Your bid is the sum of the three cards' suits (0 to 9).

You are now left with 9 cards to play 9 tricks.

Playing: Standard trick-taking rules apply. You must follow the led suit if possible; otherwise play any card. Trump (hearts) beats non-trump; highest card of led suit wins otherwise.

Scoring: If you win exactly the number of tricks equal to your bid, score +10 points. If you win more or fewer, score -5 points. Same for bots.

Strategy: Choose your bid cards wisely. High clubs are both a large bid contribution and strong trick-winners — keeping them in your playing hand may be better. Low diamonds (bid 0) are safe to put aside.

Controls: During bidding, click 3 cards to select them (yellow highlight), then click Confirm. During play, click a highlighted card to play it.`,
  settings: ninetyNineSettings,
  initialState: (seed: number, settings: NinetyNineSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver || (s as any).won || (s as any).isWon || (s as any).isComplete || (s as any).complete) return null; return { selector: '[data-testid="hint-target-ninety-nine-action"]', pulses: 3 }; },
  component: NinetyNine,
};
