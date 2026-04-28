import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CoincheState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Coinche } from "./Coinche.js";

const coincheSettings = {} as const;
type CoincheSettings = SettingsOf<typeof coincheSettings>;
type CoincheAction = { type: "play"; cardId: string };

export const coinchePlugin: GamePlugin<CoincheState, CoincheAction, typeof coincheSettings> = {
  id: "coinche",
  title: "Coinche",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Bidding Belote variant — simplified to a head-to-head trick duel.",
  howToPlay: `Coinche is a French bidding variant of Belote where doubling and re-doubling spice up the auction. In this 1v1 simplification, clubs are fixed as trump and the auction is skipped. You and the bot each receive 8 cards from a 32-card pack (7, 8, 9, 10, J, Q, K, A in each suit). Each trick: follow the led suit if able, otherwise play any card. Highest club wins; otherwise highest of the led suit. Click cards to play. Trick winner leads the next. Strategy: in true Belote/Coinche, the Jack is the highest trump (a quirk this duel does not implement) but high-card-of-trump still wins here. Lead a long side suit, then cash your trump aces. Score is tricks taken — capture 5 of 8 tricks to win.`,
  settings: coincheSettings,
  initialState: (seed: number, _settings: CoincheSettings) => initialState(seed),
  reducer,
  isTerminal,
  component: Coinche,
};
