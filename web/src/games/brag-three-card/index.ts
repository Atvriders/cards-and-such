import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { PubState, PubAction, PubSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PubGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const bragThreeCardPlugin: GamePlugin<PubState, PubAction, typeof settings> = {
  id: "brag-three-card",
  title: "Brag (Three-Card)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "British poker precursor with pair-royals.",
  howToPlay: "Brag (Three-Card) is the British 16th-century gambling card game from which poker descends. Across eight rounds press Show to reveal three random cards (Ace high to 2 low across four suits). Hand rankings, low to high: high card, pair, flush, run (straight), running flush, pair-royal (three of a kind, e.g., three Jacks). Each ranking pays a fixed reward: high card 1, pair 3, flush 5, run 7, running flush 12, pair-royal 18. The CPU also reveals; if its hand outranks yours you lose half. Total points after eight rounds wins. Pair-royal is the highest hand and trumps every other ranking; pair-royal of threes (3-3-3) is the second-highest pair-royal. Brag is the precursor to poker, with classical 'blind play' (betting without seeing your hand) absent in this digital simplification. Press Show to advance each round; the hand and result reveal immediately. Final scoreboard awards 100 points for the win, 25 for a tie. The original is a betting game; here the hands themselves drive scoring.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as PubSettings),
  reducer,
  isTerminal,
  component: PubGame,
};
