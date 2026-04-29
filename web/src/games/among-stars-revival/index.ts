import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { AmongStarsRevivalState, AmongStarsRevivalAction, AmongStarsRevivalSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { AmongStarsRevivalGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const amongStarsRevivalPlugin: GamePlugin<AmongStarsRevivalState, AmongStarsRevivalAction, typeof settings> = {
  id: "among-stars-revival",
  title: "Among the Stars: Revival",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Standalone Among the Stars expansion; rebuild damaged stations.",
  howToPlay: "Among the Stars: Revival is a draft of station-building cards over eight rounds. Each card represents a station module — Habitat, Defense, Hangar, or Trade.\n\nEach round, three cards appear: pick one and the CPU takes the highest-rank remaining. Build adjacency-bonus tableaux.\n\nScoring per tableau:\n- Sum of module ranks (1-9 each).\n- +10 per module type with 3+ pieces (station wing complete).\n- +15 additional per type with 5+ pieces.\n- +5 per same-rank pair; +10 per triplet.\n- +25 if you outscore the CPU.\n\nStrategy: Revival's damaged-station theme rewards concentration: rebuilding three Defense modules earns +10. The greedy CPU consistently grabs rank-9, leaving rank-3-7 cards for your committed suit. Strategy: pick low-rank cards in your locked suit early; chase rank later. Aim for 60-100 points. Revival expands Among the Stars into a tighter, sharper draft. Eight rounds. Four module types. One station.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as AmongStarsRevivalSettings),
  reducer,
  isTerminal,
  component: AmongStarsRevivalGame,
};
