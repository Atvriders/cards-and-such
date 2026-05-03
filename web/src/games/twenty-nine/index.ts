import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TwentyNineState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const TwentyNine = /* @__PURE__ */ lazy(() => import("./TwentyNine.js").then((mod) => ({ default: mod.TwentyNine as unknown as React.ComponentType<unknown> })));
export const twentyNineSettings = {} as const;

type TwentyNineSettingsType = SettingsOf<typeof twentyNineSettings>;
type TwentyNineAction =
  | { type: "bid"; amount: number }
  | { type: "play"; cardId: string };

export const twentyNinePlugin: GamePlugin<TwentyNineState, TwentyNineAction, typeof twentyNineSettings> = {
  id: "twenty-nine",
  title: "Twenty-Nine",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "South Asian partnership trick-taking with bidding. Reach your bid of 15-28 card points to win!",
  howToPlay: `Twenty-Nine (29) is a popular South Asian partnership trick-taking game using a 32-card deck (7 through Ace in each suit — 8 ranks per suit).

Card values: Jack = 3 points, Nine = 2 points, Ace and Ten = 1 point each. All other cards have no point value. The total points available per hand are 28, plus 1 "game" bonus point = 29.

Teams: You and Bot 2 are partners (Team 0). Bot 1 and Bot 3 are opponents (Team 1). Partners sit across from each other.

Bidding: Enter a bid between 15 and 28, representing how many card points your team will score. Bots also bid. The highest bidder names the trump suit (chosen automatically based on their strongest suit) and their team must reach that score.

Play: 8 tricks are played. Follow the led suit if possible. If you cannot follow suit you must play trump if you have it. Trump beats all non-trump cards; otherwise highest of the led suit wins.

Scoring: At the end the bidding team wins if they reached their bid total; otherwise the opposing team wins.

Controls: Enter a bid amount and click "Bid" to start. During play click a highlighted card to play it.`,
  settings: twentyNineSettings,
  initialState: (seed: number, _settings: TwentyNineSettingsType) =>
    initialState(seed, { placeholder: "none" }),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver || (s as any).won || (s as any).isWon || (s as any).isComplete || (s as any).complete) return null; return { selector: '[data-testid="hint-target-twenty-nine-action"]', pulses: 3 }; },
  component: TwentyNine,
};
