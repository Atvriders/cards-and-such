import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ScatState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const Scat = /* @__PURE__ */ lazy(() => import("./Scat.js").then((mod) => ({ default: mod.Scat as unknown as React.ComponentType<unknown> })));
export const scatSettings = {} as const;

type ScatSettingsType = SettingsOf<typeof scatSettings>;
type ScatAction =
  | { type: "draw-stock" }
  | { type: "draw-discard" }
  | { type: "knock" }
  | { type: "discard"; cardId: string };

export const scatPlugin: GamePlugin<ScatState, ScatAction, typeof scatSettings> = {
  id: "scat",
  title: "Scat (31)",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "3-card hand game. Build 31 points in one suit or three of a kind. Knock when you're ready!",
  howToPlay: `Scat, also known as 31, is a 3-player card game (you plus 2 bots) where each player holds a 3-card hand and tries to reach 31 points.

Hand values: Aces count 11, face cards (J/Q/K) and 10s count 10, number cards count face value. Your score is the total of same-suit cards — only one suit counts. Three-of-a-kind scores 30.5 regardless of suits.

Goal: Reach 31 (Ace + two 10-value cards of the same suit) or as close as possible.

Your turn: Choose one of three actions:
• Draw Stock — take the top hidden card from the stock pile, then discard one card from your hand.
• Take Discard — take the face-up top of the discard pile, then discard one card.
• Knock — signal that you're satisfied. All other players get exactly one more turn, then hands are revealed.

Scoring: The player(s) with the lowest score lose a life. Start with 3 lives. Last player with lives wins.

Strategy: Keep building toward 31 in your best suit. Watch the discard pile — useful cards may appear. Knock when your score is high enough that you're unlikely to be the lowest.

Controls: Click the stock pile or discard pile to draw, or click "Knock" to end the round. After drawing, click a card in your hand to discard it.`,
  settings: scatSettings,
  initialState: (seed: number, _settings: ScatSettingsType) =>
    initialState(seed, { placeholder: "none" }),
  reducer,
  isTerminal,
  hint: (state: ScatState): HintTarget | null => {
    if (isTerminal(state)) return null;
    return { selector: '[data-testid="hint-target-scat-primary"]', pulses: 3 };
  },
  component: Scat,
};
