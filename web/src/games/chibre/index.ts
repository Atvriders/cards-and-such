import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ChibreState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Chibre } from "./Chibre.js";

const chibreSettings = {} as const;
type ChibreSettings = SettingsOf<typeof chibreSettings>;
type ChibreAction = { type: "play"; cardId: string };

export const chibrePlugin: GamePlugin<ChibreState, ChibreAction, typeof chibreSettings> = {
  id: "chibre",
  title: "Chibre",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Western Swiss partnership Jass — simplified to a head-to-head duel.",
  howToPlay: `Chibre is the Western Swiss French-speaking partnership form of Jass. This simplified 1v1 duel preserves only the trick-play core with clubs as trump. You and the bot each receive 9 cards from a 36-card Jass pack (6, 7, 8, 9, 10, J, Q, K, A per suit). Each trick: follow the led suit if able, otherwise play any card. Highest club wins; otherwise highest of the led suit. Click cards to play. Trick winner leads next. Strategy: count trumps carefully — with 9 in the deck, every one matters. Lead long side suits to flush the bot’s clubs, then cash your trump aces and side-suit winners. Score is tricks taken — capture 5 of 9 tricks to win the round. Although true Chibre rewards Stöck and Match bonuses, this duel focuses on tricks.`,
  settings: chibreSettings,
  initialState: (seed: number, _settings: ChibreSettings) => initialState(seed),
  reducer,
  isTerminal,
  component: Chibre,
};
