import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardStackStressState, CardStackStressAction, CardStackStressSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CardStackStressGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const cardStackStressPlugin: GamePlugin<CardStackStressState, CardStackStressAction, typeof settings> = {
  id: "card-stack-stress", title: "Card Stack Stress", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Stack 8 cards in non-decreasing rank. One wrong = restart. 5 attempts.",
  howToPlay: `Card Stack Stress is a high-pressure card stacking challenge. You start with an empty stack and try to build it up to 8 cards in non-decreasing rank order. Aces count as the highest, then K, Q, J, 10, 9, ..., 2 lowest.

Each turn, press Draw to flip a card from the deck. You have two options: Stack (add this card to your tower if its rank is greater than or equal to the top of the stack) or Pass (discard it and draw again). Pass is risk-free — it costs you nothing but is also pure delay.

The catch: if you choose Stack with a card lower than the top of the stack, the entire stack collapses. That ends the attempt. Each correctly stacked card scores 20 points (recorded only after the attempt ends), and completing all 8 cards in a single run earns a 100-point bonus.

You get 5 attempts; only your best stack counts. Maximum score: 8 cards x 20 + 100 bonus = 260 points.`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as CardStackStressSettings),
  reducer, isTerminal,
  hint: (state: CardStackStressState): HintTarget | null => {
    if (isTerminal(state)) return null;
    return { selector: '[data-testid="hint-target-card-stack-stress-next"]', pulses: 3 };
  },
  component: CardStackStressGame,
};
