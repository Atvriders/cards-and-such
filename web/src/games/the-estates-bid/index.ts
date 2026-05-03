import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { TheEstatesBidState, TheEstatesBidAction, TheEstatesBidSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TheEstatesBidGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const theEstatesBidPlugin: GamePlugin<TheEstatesBidState, TheEstatesBidAction, typeof settings> = {
  id: "the-estates-bid",
  title: "The Estates: Bid Draft",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Bid and place building tiles row by row; uncompleted rows score negative.",
  howToPlay: "The Estates: Bid Draft compresses The Estates' bid-and-place into eight rounds of card drafting. Suits are city districts — Residential, Commercial, Industrial, and Park.\n\nEach round, three cards appear: pick one and the CPU takes the highest-rank remaining. Build district tableaux.\n\nScoring per tableau:\n- Sum of district ranks (1-9 each).\n- +10 per district with 3+ buildings (row complete).\n- +15 additional per district with 5+ buildings.\n- +5 per same-rank pair; +10 per triplet.\n- +25 if you outscore the CPU.\n\nStrategy: The Estates penalizes incomplete rows in the original; here we reward completed sets with +10. Concentrate on a district to lock the bonus early. The greedy CPU spikes high ranks, freeing mid-tier picks for your strategy. Take Commercial-3 over Park-9 if it locks your +10. Aim for 60-100 points. The Estates: Bid Draft is the classic bidding framework reimagined as draft pressure.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as TheEstatesBidSettings),
  reducer,
  isTerminal,
  hint: (state: any) => {
      if (state.phase === "drafting") return { selector: '[data-testid="hint-target-the-estates-bid-primary"]', pulses: 3 };
      if (state.phase === "round-done") return { selector: '[data-testid="hint-target-the-estates-bid-next"]', pulses: 3 };
      return null;
    },
  component: TheEstatesBidGame,
};
