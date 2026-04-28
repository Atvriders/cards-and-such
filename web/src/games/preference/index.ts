import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PreferenceState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Preference } from "./Preference.js";

const preferenceSettings = {} as const;
type PreferenceSettings = SettingsOf<typeof preferenceSettings>;
type PreferenceAction = { type: "play"; cardId: string };

export const preferencePlugin: GamePlugin<PreferenceState, PreferenceAction, typeof preferenceSettings> = {
  id: "preference",
  title: "Preference",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Central European 3-hand bidding game — set-trump duel here.",
  howToPlay: `Preference (Préférence) is a popular Central European trick-taking game traditionally played by three with bidding for trump. This simplified 1v1 version sets hearts as trump and skips the auction. You and the bot each receive 10 cards from a 32-card stripped pack (7, 8, 9, 10, J, Q, K, A in each suit). Each trick: follow the led suit if able, else play any card. Highest heart wins; otherwise highest of the led suit. Click cards to play. Trick winner leads next. Strategy: count trumps aggressively, lead long side suits early to flush trumps, then cash your aces. Score is tricks taken — capture 6 of 10 tricks to win. Although classic Preference rewards bidding accuracy and partner play, the trick-play core is preserved here.`,
  settings: preferenceSettings,
  initialState: (seed: number, _settings: PreferenceSettings) => initialState(seed),
  reducer,
  isTerminal,
  component: Preference,
};
