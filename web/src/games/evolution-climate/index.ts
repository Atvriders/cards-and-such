import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { EvolutionClimateState, EvolutionClimateAction, EvolutionClimateSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { EvolutionClimateGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const evolutionClimatePlugin: GamePlugin<EvolutionClimateState, EvolutionClimateAction, typeof settings> = {
  id: "evolution-climate",
  title: "Evolution: Climate",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Adds temperature track affecting species viability.",
  howToPlay: "Evolution: Climate is a draft over eight rounds with climate-aware suits — Cold, Temperate, Warm, and Tropical. Adapt your species to survive.\n\nEach round, three cards appear: pick one and the CPU takes the highest-rank remaining. Build a tableau.\n\nScoring per tableau:\n- Sum of trait ranks (1-9 each).\n- +10 per climate band with 3+ traits.\n- +15 additional per band with 5+ traits.\n- +5 per same-rank pair; +10 per triplet.\n- +25 if you outscore the CPU.\n\nStrategy: Climate forces you to commit to a band — three Temperate cards earns +10. The greedy CPU takes the highest rank, opening cheap mid-tier cards for your specialty. Take Tropical-4 over Cold-8 if Tropical-4 completes your set. Aim for 60-100 points. Evolution: Climate adds temperature pressure to the adaptation drafting flow. Your species must master one band — over eight rounds of careful card selection.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as EvolutionClimateSettings),
  reducer,
  isTerminal,
  component: EvolutionClimateGame,
};
