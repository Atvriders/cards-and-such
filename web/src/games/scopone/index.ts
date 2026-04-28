import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ScoponeState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Scopone } from "./Scopone.js";

const scoponeSettings = {} as const;
type ScoponeSettings = SettingsOf<typeof scoponeSettings>;
type ScoponeAction = { type: "play"; cardId: string };

export const scoponePlugin: GamePlugin<ScoponeState, ScoponeAction, typeof scoponeSettings> = {
  id: "scopone",
  title: "Scopone",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "4-handed Scopa simplified to a head-to-head capture-trick duel.",
  howToPlay: `Scopone is the four-handed partnership version of Italian Scopa, the classic capture game. This simplified 1v1 duel uses the trick-play structure of Scopa’s extended cousin. You and the bot each receive 10 cards from a 40-card Italian deck (A, 2, 3, 4, 5, 6, 7, J, Q, K in each suit). There is no trump suit — only the led suit can win the trick. Highest of the led suit wins. Click any card to play. Trick winner leads the next. Strategy: lead long suits to win cheaply with high cards. Save your aces and 7s for late tricks. Score is tricks taken — capture 6 of 10 tricks to win the round. The seed determines deals; replay with the same seed for analysis. Although true Scopone tracks captured-card points and sweep bonuses, this version focuses purely on tricks.`,
  settings: scoponeSettings,
  initialState: (seed: number, _settings: ScoponeSettings) => initialState(seed),
  reducer,
  isTerminal,
  component: Scopone,
};
