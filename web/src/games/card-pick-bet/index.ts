import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardPickBetState, CardPickBetAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CardPickBet } from "./CardPickBet.js";

export const cardPickBetSettings = {
  rounds: { kind: "enum" as const, label: "Rounds", options: ["5", "10", "15"] as const, default: "10" as const },
} as const;
type S = SettingsOf<typeof cardPickBetSettings>;

export const cardPickBetPlugin: GamePlugin<CardPickBetState, CardPickBetAction, typeof cardPickBetSettings> = {
  id: "card-pick-bet",
  title: "Card Pick Bet",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Predict whether the next card will be higher or lower than the current one.",
  howToPlay: `Card Pick Bet is a classic higher-or-lower guessing game. Each round you see a face-up card and must predict whether the next card drawn from the shuffled deck will have a higher or lower rank.

Click the Higher button if you think the next card ranks above the current one, or the Lower button if you think it ranks below. The next card is then revealed.

Rank order from low to high: 2, 3, 4, 5, 6, 7, 8, 9, 10, Jack, Queen, King, Ace. A correct prediction earns 10 points. Ties score nothing.

After seeing the result, click Next to advance to the following round. Play 5, 10, or 15 rounds depending on your settings.

Tips: A 7 in the middle of the rank range gives you roughly even odds either way. If you see a low card like a 2 or 3, bet Higher. If you see a high card like a Queen or King, bet Lower. Track which high and low cards have appeared to refine your guesses.`,
  settings: cardPickBetSettings,
  initialState: (seed: number, settings: S) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: CardPickBetState): HintTarget | null => (state.phase === "playing" ? { selector: '[data-testid="hint-target-card-pick-bet-primary"]', pulses: 3 } : null),
  component: CardPickBet,
};
