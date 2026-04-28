import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SchieberJassState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SchieberJass } from "./SchieberJass.js";

const schieberJassSettings = {} as const;
type SchieberJassSettings = SettingsOf<typeof schieberJassSettings>;
type SchieberJassAction = { type: "play"; cardId: string };

export const schieberJassPlugin: GamePlugin<SchieberJassState, SchieberJassAction, typeof schieberJassSettings> = {
  id: "schieber-jass",
  title: "Schieber Jass",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Partnership Swiss Jass with pass-trump option — 1v1 duel here.",
  howToPlay: `Schieber Jass is the most popular partnership form of Swiss Jass, where the dealer’s partner can pass (schieben) the choice of trump back. This simplified 1v1 duel uses spades as trump. You and the bot each receive 9 cards from a 36-card Jass pack (6, 7, 8, 9, 10, J, Q, K, A in each suit). Each trick: follow the led suit if able, otherwise play any card. Highest spade wins; otherwise highest of the led suit. Click cards to play. Trick winner leads next. Strategy: in true Jass the Jack of trump (Bauer) and 9 of trump (Nell) are top trumps — a quirk this version skips. Lead long side suits early. Score is tricks taken — capture 5 of 9 tricks to win the round. Seeds reproduce deals.`,
  settings: schieberJassSettings,
  initialState: (seed: number, _settings: SchieberJassSettings) => initialState(seed),
  reducer,
  isTerminal,
  component: SchieberJass,
};
