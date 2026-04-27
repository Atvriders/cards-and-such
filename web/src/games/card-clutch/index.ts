import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardClutchState, CardClutchAction, CardClutchSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CardClutchGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const cardClutchPlugin: GamePlugin<CardClutchState, CardClutchAction, typeof settings> = {
  id: "card-clutch", title: "Card Clutch", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "8 normal rounds + 1 clutch high-stakes finale.",
  howToPlay: `Card Clutch is a high-low prediction game with a dramatic finale. Each round you predict whether the next dealt card will be HIGH (rank 8 or above — that's 8, 9, 10, J, Q, K, A) or LOW (rank 7 or below — 2, 3, 4, 5, 6, 7). After your prediction, the card is revealed and scored.

There are 9 rounds total: 8 normal rounds and one final clutch round. Normal rounds award +10 for a correct prediction and 0 for a wrong one. The clutch round (round 9) is high-stakes: a correct prediction scores +50, but a wrong one DEDUCTS 25 from your running total. The clutch round is announced clearly with a flashing red banner — don't blow it!

Score is clamped at zero, so you can't end the game in the negatives. With pure 50/50 odds (the deck has 7 high-rank values and 6 low-rank values, so HIGH is slightly more likely — about 54% chance), expected scores are around 80 points if you guess HIGH every time.

Maximum is 130 points (8 normal wins + 1 clutch win = 80 + 50).`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as CardClutchSettings),
  reducer, isTerminal, component: CardClutchGame,
};
