import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DifferenzlerJassState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DifferenzlerJass } from "./DifferenzlerJass.js";

const differenzlerJassSettings = {} as const;
type DifferenzlerJassSettings = SettingsOf<typeof differenzlerJassSettings>;
type DifferenzlerJassAction = { type: "play"; cardId: string };

export const differenzlerJassPlugin: GamePlugin<DifferenzlerJassState, DifferenzlerJassAction, typeof differenzlerJassSettings> = {
  id: "differenzler-jass",
  title: "Differenzler Jass",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Bidding Jass game where you predict your trick total.",
  howToPlay: `Differenzler Jass is a Swiss Jass bidding variant where each player predicts their exact final trick total and is scored on the difference. This simplified 1v1 duel skips the bid; hearts are trump. You and the bot each receive 9 cards from the 36-card Jass pack (6, 7, 8, 9, 10, J, Q, K, A in each suit). Each trick: follow the led suit if able, otherwise play any card. Highest heart wins; otherwise highest of the led suit. Click cards to play. Trick winner leads next. Strategy: count hearts and aces aggressively. Lead long side suits early to draw the bot’s trumps, then cash your trump aces. Score is tricks taken — capture 5 of 9 tricks to win the round. Seeds determine deals; replay the same seed for analysis.`,
  settings: differenzlerJassSettings,
  initialState: (seed: number, _settings: DifferenzlerJassSettings) => initialState(seed),
  reducer,
  isTerminal,
  component: DifferenzlerJass,
};
