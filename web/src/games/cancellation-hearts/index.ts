import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CancellationHeartsState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const CancellationHearts = /* @__PURE__ */ lazy(() => import("./CancellationHearts.js").then((mod) => ({ default: mod.CancellationHearts as unknown as React.ComponentType<unknown> })));
const cancellationHeartsSettings = {} as const;
type CancellationHeartsSettings = SettingsOf<typeof cancellationHeartsSettings>;
type CancellationHeartsAction = { type: "play"; cardId: string };

export const cancellationHeartsPlugin: GamePlugin<CancellationHeartsState, CancellationHeartsAction, typeof cancellationHeartsSettings> = {
  id: "cancellation-hearts",
  title: "Cancellation Hearts",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Hearts variant scaled down: cancel pairs in a head-to-head duel.",
  howToPlay: `Cancellation Hearts is normally played by 6 to 11 players using two combined decks where identical cards cancel each other and remove themselves from a trick. This single-deck duel version captures the spirit by playing high-and-low: any card matched in suit and rank by the led suit-leader cancels both for trick-winning purposes — but with one deck this rarely happens, so play unfolds like classic Hearts. You and the bot each receive 13 cards. Each round, follow the led suit if possible. Capturing tricks scores points. Click cards to play. Strategy: lead suits the bot is short in, dump high hearts onto opponent-led tricks, and conserve low spades to dodge the Queen. Win 6 or more of the 13 tricks to win the round and earn a point.`,
  settings: cancellationHeartsSettings,
  initialState: (seed: number, _settings: CancellationHeartsSettings) => initialState(seed),
  reducer,
  isTerminal,
  hint: (state: CancellationHeartsState): HintTarget | null => {
    if (isTerminal(state)) return null;
    return { selector: '[data-testid="hint-target-cancellation-hearts-primary"]', pulses: 3 };
  },
  component: CancellationHearts,
};
