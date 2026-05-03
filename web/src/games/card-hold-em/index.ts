import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardHoldEmState, CardHoldEmAction, CardHoldEmSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CardHoldEmGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const cardHoldEmPlugin: GamePlugin<CardHoldEmState, CardHoldEmAction, typeof settings> = {
  id: "card-hold-em", title: "Card Hold-Em", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Bet on a 2-card hand: STRONG or WEAK. 12 rounds.",
  howToPlay: `Card Hold-Em is a tiny take on poker hand-strength evaluation. Each round, you predict whether your soon-to-be-dealt 2-card hand will be STRONG or WEAK before seeing the cards. After your prediction, the hand is revealed.

A hand is STRONG if the sum of poker ranks (Aces=14, K=13, Q=12, J=11, 10=10, ..., 2=2) is at least 18, OR if the cards form a pair (any pair, even a pair of 2s, counts as STRONG). Everything else is WEAK. Examples: K+10 (23) is strong; A+5 (19) is strong; 7+8 (15) is weak; 2+2 is strong (a pair).

Each correct prediction scores 10 points. Wrong picks score 0. There are 12 rounds, so the maximum score is 120 points.

Strategy: roughly 50% of all 2-card hands qualify as STRONG (any high pair, any unsuited big-card combo). With pure 50/50 odds, the math says you'll average around 60 points either way — so trust your gut and have fun guessing!`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as CardHoldEmSettings),
  reducer, isTerminal,
  hint: (state: CardHoldEmState): HintTarget | null => {
    if (isTerminal(state)) return null;
    return { selector: '[data-testid="hint-target-card-hold-em-next"]', pulses: 3 };
  },
  component: CardHoldEmGame,
};
