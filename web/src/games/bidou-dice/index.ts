import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BidouDiceState, BidouDiceAction, BidouDiceSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BidouDiceGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const bidouDicePlugin: GamePlugin<BidouDiceState, BidouDiceAction, typeof settings> = {
  id: "bidou-dice",
  title: "Bidou Dice",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "French bluffing dice. Predict the rank tier: Bidou, Bido, or Petite.",
  howToPlay: "Bidou is a French bluffing dice game with three named ranks. In this single-player version, three dice roll each round and you call which tier: Bidou (1-1-1, the holy trinity), Bido (any two 1s with another die), or Petite (everything else).\n\nBidou covers 1 of 216 outcomes (0.46%) and pays a massive 200. Bido covers 15 of 216 outcomes (6.9%) and pays 25. Petite covers the remaining 200 outcomes (92.6%) and pays 4. Expected value: Bidou 0.93, Bido 1.74, Petite 3.70 — Petite has the safest expectation, while Bido and Bidou trade smaller probability for higher payout.\n\nThe game runs 12 rounds. Real Bidou is played under a cup with hidden bids; here the rolls are open. Average expected score lands near 50 points. A single Bidou hit lifts you into leaderboard territory — call it sparingly when intuition suggests the seed run is generous, and lean on Petite or Bido for steady scoring.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as BidouDiceSettings),
  reducer,
  isTerminal,
  hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-bidou-dice-primary"]', pulses: 3 }),
  component: BidouDiceGame,
};
