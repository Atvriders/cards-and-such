import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { OmnibusHeartsState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const OmnibusHearts = /* @__PURE__ */ lazy(() => import("./OmnibusHearts.js").then((mod) => ({ default: mod.OmnibusHearts as unknown as React.ComponentType<unknown> })));
const omnibusHeartsSettings = {} as const;
type OmnibusHeartsSettings = SettingsOf<typeof omnibusHeartsSettings>;
type OmnibusHeartsAction = { type: "play"; cardId: string };

export const omnibusHeartsPlugin: GamePlugin<OmnibusHeartsState, OmnibusHeartsAction, typeof omnibusHeartsSettings> = {
  id: "omnibus-hearts",
  title: "Omnibus Hearts",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Hearts variant with a bonus for capturing the Ten of Diamonds.",
  howToPlay: `Omnibus Hearts is a Hearts family variant that adds a coveted bonus card: the Ten of Diamonds, called the Omnibus. While avoiding hearts and the Queen of Spades is the traditional aim, capturing the 10♦ grants a substantial bonus. In this duel-style version you and the bot each receive 13 cards. Each round, follow the led suit if you can; otherwise discard freely. Highest card of the led suit wins the trick. Goal: take more tricks than the bot. Capturing the 10♦ awards a bonus trick to the winner. Click cards to play them. The deal is shuffled with a deterministic seed so replays are stable. Strategy: try to win whichever trick contains the Ten of Diamonds while shedding low cards in suits the bot is strong in. Take seven or more tricks out of 13 to win the round.`,
  settings: omnibusHeartsSettings,
  initialState: (seed: number, _settings: OmnibusHeartsSettings) => initialState(seed),
  reducer,
  isTerminal,
  hint: (state: any) => {
      if (state.phase === "playing") return { selector: '[data-testid="hint-target-omnibus-hearts-hand"]', pulses: 3 };
      return null;
    },
  component: OmnibusHearts,
};
