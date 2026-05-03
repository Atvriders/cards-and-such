import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardUpDownState, CardUpDownAction, CardUpDownSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CardUpDown } from "./Game.js";

const settings = {
  rounds: { kind: "enum" as const, label: "Rounds", options: ["10", "20"] as const, default: "10" as const },
} as const;

type S = SettingsOf<typeof settings>;

export const cardUpDownPlugin: GamePlugin<CardUpDownState, CardUpDownAction, typeof settings> = {
  id: "card-up-down",
  title: "Card Up Down",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Guess whether the next card ranks higher or lower than the current card. Build streaks for bonus points!",
  howToPlay: `Card Up Down is a classic card prediction game. A card is shown face up. Your job is to predict whether the next card from the shuffled deck will rank higher or lower.

Card ranks run from 2 (lowest) through Ace (highest). Ties count as correct — lucky you! A correct guess earns 10 points base, plus 2 bonus points per consecutive correct answer (your streak). A wrong guess resets the streak to zero.

Press Higher or Lower to make your prediction. The next card is then revealed. Press Next to continue to the next round.

Use Settings to play 10 or 20 rounds. The deck is freshly shuffled each game. Track your streak — the longer you stay correct, the more each right answer pays.

Think carefully as the game progresses: if you have seen many high cards, the next is more likely to be low. Final score and streak are shown at game over. How high can you build your streak?`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as CardUpDownSettings),
  reducer, isTerminal,
  hint: (state: any) => {
    if (state.phase === "gameover") return null;
    if (state.phase === "reveal") return { selector: '[data-testid="hint-target-card-up-down-next"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-card-up-down-up"]', pulses: 3 };
  }, component: CardUpDown,
};
