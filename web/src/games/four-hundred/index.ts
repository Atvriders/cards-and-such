import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { FourHundredState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { FourHundred } from "./FourHundred.js";

const fourHundredSettings = {} as const;
type FourHundredSettings = SettingsOf<typeof fourHundredSettings>;
type FourHundredAction = { type: "play"; cardId: string };

export const fourHundredPlugin: GamePlugin<FourHundredState, FourHundredAction, typeof fourHundredSettings> = {
  id: "four-hundred",
  title: "Four Hundred",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Euchre cousin played to 400 points — simplified single-deal duel.",
  howToPlay: `Four Hundred is a partnership Euchre variant played to 400 points. This single-round duel boils it down to a single deal between you and the bot using a 24-card Euchre pack. Diamonds are trump. Each player receives 6 cards. Tricks follow standard rules: follow the led suit if able; otherwise play any card. Highest trump wins; if no trump, highest of the led suit. Click cards to play; the trick winner leads next. Strategy: with only 6 cards each, every card matters. Lead long side suits to force the bot to commit trumps, then cash any remaining diamonds. Score equals tricks won. Take at least 4 of the 6 tricks to win the round and earn 100 points toward the symbolic 400-point match. The seed reproduces deals.`,
  settings: fourHundredSettings,
  initialState: (seed: number, _settings: FourHundredSettings) => initialState(seed),
  reducer,
  isTerminal,
  component: FourHundred,
};
