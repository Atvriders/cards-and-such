import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SpotHeartsState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const SpotHearts = /* @__PURE__ */ lazy(() => import("./SpotHearts.js").then((mod) => ({ default: mod.SpotHearts as unknown as React.ComponentType<unknown> })));
const spotHeartsSettings = {} as const;
type SpotHeartsSettings = SettingsOf<typeof spotHeartsSettings>;
type SpotHeartsAction = { type: "play"; cardId: string };

export const spotHeartsPlugin: GamePlugin<SpotHeartsState, SpotHeartsAction, typeof spotHeartsSettings> = {
  id: "spot-hearts",
  title: "Spot Hearts",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Hearts variant where each heart's pip value is its penalty score.",
  howToPlay: `Spot Hearts is a sharper take on the classic Hearts game where every heart’s pip value matters: a 2♥ costs two, a King♥ costs thirteen, and the Queen of Spades is also dangerous. In this trimmed duel you and the bot each draw 13 cards from a single 52-card deck. Each trick, follow the led suit if possible; otherwise play any card. The highest card of the led suit captures the trick. Tricks containing high hearts hurt the winner. Take fewer trick points than the bot to win. Click any card to play. Strategy: shed your highest hearts onto tricks you cannot win, watch which spades have left the deck, and aim to short-suit yourself in hearts as quickly as possible. Win the round by taking at least seven tricks of the 13 played.`,
  settings: spotHeartsSettings,
  initialState: (seed: number, _settings: SpotHeartsSettings) => initialState(seed),
  reducer,
  isTerminal,
  hint: (state: any) => {
      if (state.phase === "playing") return { selector: '[data-testid="hint-target-spot-hearts-hand"]', pulses: 3 };
      return null;
    },
  component: SpotHearts,
};
