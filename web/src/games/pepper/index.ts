import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PepperState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Pepper } from "./Pepper.js";

const pepperSettings = {} as const;
type PepperSettings = SettingsOf<typeof pepperSettings>;
type PepperAction = { type: "play"; cardId: string };

export const pepperPlugin: GamePlugin<PepperState, PepperAction, typeof pepperSettings> = {
  id: "pepper",
  title: "Pepper",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Euchre variant with a 'pepper' bid — set trump duel.",
  howToPlay: `Pepper is a Midwestern American Euchre variant featuring a special pepper bid for taking all six tricks. In this 1v1 simplification, clubs are trump and the deck is the standard Euchre 24 (9, 10, J, Q, K, A in each suit). You and the bot are dealt 6 cards each. Each trick: follow the led suit if able, otherwise play any card. Highest club wins; if no club, highest of the led suit wins. Click cards to play. The winner of each trick leads the next. Strategy: pepper rewards aggressive play — lead trumps early to flush the bot, then cash side-suit winners. Take at least 4 of the 6 tricks to win this duel. Although the famous Jack-of-trump (right bower) bonus is a Pepper hallmark, this simplified version uses straight high-card-of-trump rules.`,
  settings: pepperSettings,
  initialState: (seed: number, _settings: PepperSettings) => initialState(seed),
  reducer,
  isTerminal,
  component: Pepper,
};
