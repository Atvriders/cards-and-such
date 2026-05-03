import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TuteState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const Tute = /* @__PURE__ */ lazy(() => import("./Tute.js").then((mod) => ({ default: mod.Tute as unknown as React.ComponentType<unknown> })));
export const tuteSettings = {} as const;
type TuteSettings = SettingsOf<typeof tuteSettings>;
type TuteAction = { type: "play"; cardId: string };

export const tutePlugin: GamePlugin<TuteState, TuteAction, typeof tuteSettings> = {
  id: "tute",
  title: "Tute",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Spanish trick-taking game with a 40-card deck. Win 61+ points to defeat the bot.",
  howToPlay: `Tute is a popular Spanish trick-taking card game played with a 40-card deck (Ace through 7, plus Jack, Queen, King — no 8, 9, 10).

Setup: Ten cards are dealt to each player. One additional card determines the trump suit for the entire hand.

Card values: Ace = 11 points, 3 = 10, King = 4, Queen = 3, Jack = 2, all others = 0. Total deck points = 120.

Following suit rules (stricter than Briscola):
1. You MUST follow the led suit if you can.
2. If you cannot follow suit, you MUST play a trump card if you have one.
3. Only if you have neither may you play any card.

Winning tricks: The highest trump card wins. If no trump is played, the highest card of the led suit wins. Winner of each trick leads the next.

Scoring: The player (or team) that captures 61 or more points wins. Exactly 60-60 is a draw.

Strategy: Track which high-value cards (Ace, 3) have been played. Conserve your trumps for capturing valuable cards, and use the forced-follow rule to your advantage by leading suits the opponent must follow.`,
  settings: tuteSettings,
  initialState: (seed: number, _settings: TuteSettings) => initialState(seed),
  reducer,
  isTerminal,
  hint: (state: any) => {
      if (state.phase === "playing") return { selector: '[data-testid="hint-target-tute-hand"]', pulses: 3 };
      return null;
    },
  component: Tute,
};
