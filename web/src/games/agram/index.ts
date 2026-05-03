import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { AgramState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const Agram = /* @__PURE__ */ lazy(() => import("./Agram.js").then((mod) => ({ default: mod.Agram as unknown as React.ComponentType<unknown> })));
export const agramSettings = {} as const;

type AgramSettingsType = SettingsOf<typeof agramSettings>;
type AgramAction = { type: "play"; cardId: string };

export const agramPlugin: GamePlugin<AgramState, AgramAction, typeof agramSettings> = {
  id: "agram",
  title: "Agram",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "West African trick-taking. No trump. Win the last trick to win the hand!",
  howToPlay: `Agram is a fast trick-taking game originating in West Africa, played with a 40-card deck (standard deck with 5s and 10s removed).

Setup: Each player receives 5 cards. There is no trump suit — rank alone decides tricks, and only the led suit can win.

Play: The leading player plays a card, setting the led suit. You must follow suit if you have cards of that suit. If you cannot follow suit you may play any card, but only cards of the led suit can win the trick. The highest card of the led suit wins.

Goal: Only the LAST trick matters. The player who wins the 5th (final) trick wins the hand, regardless of how many earlier tricks they took. Earlier tricks are irrelevant — they are just discarded.

Strategy: This creates a unique dilemma. In early tricks you may want to lose on purpose to save your strong cards for the critical last trick. Be careful not to waste high cards early — but also watch what suit your opponent might lead on the final trick.

Controls: Click a highlighted card to play it. Dimmed cards cannot be played this trick.`,
  settings: agramSettings,
  initialState: (seed: number, _settings: AgramSettingsType) =>
    initialState(seed, { placeholder: "none" }),
  reducer,
  isTerminal,
  hint: (state: any) => {
    if (state.phase === "done") return null;
    if (state.turn !== 0) return null;
    return { selector: '[data-testid="hint-target-agram-primary"]', pulses: 3 };
  },
  component: Agram,
};
