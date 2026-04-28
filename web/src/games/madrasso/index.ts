import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MadrassoState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Madrasso } from "./Madrasso.js";

const madrassoSettings = {} as const;
type MadrassoSettings = SettingsOf<typeof madrassoSettings>;
type MadrassoAction = { type: "play"; cardId: string };

export const madrassoPlugin: GamePlugin<MadrassoState, MadrassoAction, typeof madrassoSettings> = {
  id: "madrasso",
  title: "Madrasso",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Venetian 4-player partnership game — simplified to a 1v1 duel.",
  howToPlay: `Madrasso is a Venetian 4-player partnership game on the 40-card Italian deck. This 1v1 simplification preserves only the trick-play core with clubs as trump. You and the bot each receive 10 cards from the Italian pack (A, 2, 3, 4, 5, 6, 7, J, Q, K in each suit — no 8/9/10). Each trick: follow the led suit if able, otherwise play any card. Highest club wins; otherwise highest of the led suit. Click cards to play. Trick winner leads next. Strategy: count clubs carefully, lead long side suits to flush out the bot’s trumps, then cash your remaining trumps. Score is tricks taken; capture 6 of 10 tricks to win. Although true Madrasso rewards declarations of certain card combinations and partnership signals, this version focuses on the tricks.`,
  settings: madrassoSettings,
  initialState: (seed: number, _settings: MadrassoSettings) => initialState(seed),
  reducer,
  isTerminal,
  component: Madrasso,
};
