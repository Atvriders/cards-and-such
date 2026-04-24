import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { PriceGuessState, PriceGuessAction, PriceGuessSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PriceGuess } from "./Game.js";

const settings = {
  items: {
    kind: "enum" as const,
    label: "Items",
    options: ["10", "15", "20"] as const,
    default: "10" as const,
  },
} as const;

export const priceGuessPlugin: GamePlugin<PriceGuessState, PriceGuessAction, typeof settings> = {
  id: "price-guess",
  title: "Price Guess",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Guess the price of everyday grocery and household items. Get within 10% to win the round.",
  howToPlay: `Price Guess tests how well you know the cost of everyday items. Each round you are shown the name of a common grocery or household product — a box of cereal, a bottle of shampoo, a bag of rice, and so on. Your task is to type in what you think that item costs at a typical store.

Scoring is based on how close your guess is to the real target price. If your guess is within 10% of the actual price, you win that item and earn 1,000 points. If you are within 25%, you earn 500 points. Within 50% earns 200 points. More than 50% off earns zero.

After submitting your guess, the actual price is revealed along with how many points you earned. Click Next Item to move to the following product. There are no time limits, so think carefully.

You can choose to play with 10, 15, or 20 items. A full 20-item game with perfect pricing earns 20,000 points. Items are shuffled randomly each game so you will see a different selection every time. At the end of the game your total score and the count of items you priced correctly (within 10%) are shown. See how many you can get right — a score of 10+ wins is considered expert level!`,
  settings,
  initialState: (seed: number, s: PriceGuessSettings) => initialState(seed, s),
  reducer,
  isTerminal,
  component: PriceGuess,
} as unknown as GamePlugin;
