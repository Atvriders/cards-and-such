import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { FoxInForestState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const FoxInForest = /* @__PURE__ */ lazy(() => import("./FoxInForest.js").then((mod) => ({ default: mod.FoxInForest as unknown as React.ComponentType<unknown> })));
const foxInForestSettings = {} as const;
type FoxInForestSettings = SettingsOf<typeof foxInForestSettings>;
type FoxInForestAction = { type: "play"; cardId: string };

export const foxInForestPlugin: GamePlugin<FoxInForestState, FoxInForestAction, typeof foxInForestSettings> = {
  id: "fox-in-forest",
  title: "The Fox in the Forest",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Two-player trumping game — set-trump duel.",
  howToPlay: `The Fox in the Forest is a modern two-player trumping card game with a fairy-tale theme. This simplified version sets spades as trump and skips the special character cards. You and the bot each receive 13 cards from a standard 52-card deck. Each trick: follow the led suit if able, otherwise play any card. Highest spade wins; otherwise highest of the led suit. Click cards to play. Trick winner leads next. Strategy: in true Fox in the Forest, scoring rewards taking exactly 7-9 tricks of 13 — too few or too many is bad. In this simplified version, just aim to win more tricks than the bot. Lead a long side suit early to flush the bot’s spades, then run your trumps. Capture 7 of 13 tricks to win the duel.`,
  settings: foxInForestSettings,
  initialState: (seed: number, _settings: FoxInForestSettings) => initialState(seed),
  reducer,
  isTerminal,
  hint: (state: any) => {
      if (state.phase === "playing") return { selector: '[data-testid="hint-target-fox-in-forest-hand"]', pulses: 3 };
      return null;
    },
  component: FoxInForest,
};
