import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { FortuneTellerState, FortuneTellerAction, FortuneTellerSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const FortuneTeller = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.FortuneTeller as unknown as React.ComponentType<unknown> })));
const settings = {
  deckSize: {
    kind: "enum" as const,
    label: "Deck Size",
    options: ["16", "32"] as const,
    default: "32" as const,
  },
} as const;

export const fortuneTellerPlugin: GamePlugin<FortuneTellerState, FortuneTellerAction, typeof settings> = {
  id: "fortune-teller",
  title: "Fortune Teller",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Draw cards from a mystical deck and receive a personal fortune with each one.",
  howToPlay: `Fortune Teller is a relaxing, fortune-cookie style card experience. A shuffled deck of 16 or 32 cards waits face-down. Each card hides a unique fortune — a whimsical prediction, piece of wisdom, or playful prophecy.

To play, simply click "Draw Your Fortune" to reveal the top card. The card flips to show its rank and suit, and your personal fortune for that card is displayed below. Every card in the deck carries one of 32 hand-crafted fortune messages, assigned at random when the deck is shuffled.

Keep drawing to reveal more cards and collect more fortunes. Work through the entire deck to see all the messages waiting for you. Once the last card is drawn, the reading is complete.

There is no winning or losing — Fortune Teller is purely for fun and reflection. The score is simply the number of cards you drew times ten, as a memento of your reading.

After completing a reading, click "New Reading" to shuffle a brand-new deck with fresh fortune assignments.

Settings: choose a 16-card half-deck for a quicker reading, or a full 32-card deck for a longer session. Each card's fortune is assigned fresh with every new shuffle, so no two readings are ever the same. Enjoy the mystery!`,
  settings,
  initialState: (seed: number, s: FortuneTellerSettings) => initialState(seed, s),
  reducer,
  isTerminal,
  hint: (state: FortuneTellerState): HintTarget | null => {
    if (isTerminal(state)) return null;
    return { selector: '[data-testid="hint-target-fortune-teller-primary"]', pulses: 3 };
  },
  component: FortuneTeller,
};
