import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SpoilFiveState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const SpoilFive = /* @__PURE__ */ lazy(() => import("./SpoilFive.js").then((mod) => ({ default: mod.SpoilFive as unknown as React.ComponentType<unknown> })));
const spoilFiveSettings = {} as const;
type SpoilFiveSettings = SettingsOf<typeof spoilFiveSettings>;
type SpoilFiveAction = { type: "play"; cardId: string };

export const spoilFivePlugin: GamePlugin<SpoilFiveState, SpoilFiveAction, typeof spoilFiveSettings> = {
  id: "spoil-five",
  title: "Spoil Five",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Irish trick game where five tricks decides the round.",
  howToPlay: `Spoil Five is an Irish trick-taking game where the goal is either to win three of five tricks (jink) or to spoil the hand so that no one wins three. This simplified 1v1 duel uses hearts as trump. You and the bot each receive 5 cards from a standard 52-card deck. Each trick: follow the led suit if able, otherwise play any card including trump. Highest heart wins; otherwise highest of the led suit. Click cards to play. Trick winner leads next. Strategy: with only 5 tricks, every card is precious. Save your highest cards for late tricks. Lead long side suits to draw out the bot’s trumps. Score is tricks taken — capture 3 of the 5 tricks for a Jink and win the round; lower than 3 means the hand is spoiled.`,
  settings: spoilFiveSettings,
  initialState: (seed: number, _settings: SpoilFiveSettings) => initialState(seed),
  reducer,
  isTerminal,
  hint: (state: any) => {
      if (state.phase === "playing") return { selector: '[data-testid="hint-target-spoil-five-hand"]', pulses: 3 };
      return null;
    },
  component: SpoilFive,
};
