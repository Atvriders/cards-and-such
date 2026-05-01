import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SpiderFourSuitsState, SpiderFourSuitsAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SpiderFourSuitsGame } from "./Game.js";

export const spiderFourSuitsPlugin: GamePlugin<SpiderFourSuitsState, SpiderFourSuitsAction, Record<string, never>> = {
  id: "spider-four-suits",
  title: "Spider (Four Suits)",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Hard Spider — full two-deck game with all four suits.",
  howToPlay: `Spider (Four Suits) is the hardest standard Spider variant, played with two full 52-card decks for 104 cards across all four suits.

Setup: 10 tableau columns. First 4 with 6 cards (5 face-down + 1 face-up), last 6 with 5. The remaining 50 cards form the stock for 5 deal-rows.

Tableau: Build down by rank. Placing any suit on a higher rank is fine, but multi-card moves require all picked cards to be in same-suit descending order — mixed-suit runs cannot be lifted as a unit.

Goal: Build 8 complete same-suit K→A sequences. Each is automatically removed when complete.

Tips: Same-suit clusters are precious — try to keep them intact. Use empty columns aggressively to disentangle mixed-suit piles. Don't deal from stock unless you're truly stuck — extra cards usually make life harder.`,
  settings: {} as const,
  initialState: (seed: number) => initialState(seed, {}),
  reducer,
  isTerminal,
  component: SpiderFourSuitsGame,
} as unknown as GamePlugin;
