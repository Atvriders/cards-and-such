import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { EvolutionTraitsState, EvolutionTraitsAction, EvolutionTraitsSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { EvolutionTraitsGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const evolutionTraitsPlugin: GamePlugin<EvolutionTraitsState, EvolutionTraitsAction, typeof settings> = {
  id: "evolution-traits",
  title: "Evolution: Traits Draft",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Draft trait cards to shape species diet and defense.",
  howToPlay: "Evolution: Traits Draft is an eight-round draft where you shape a species via trait cards. Suits are diet/defense families — Carnivore, Herbivore, Defensive, and Pack.\n\nEach round, three cards appear: pick one and the CPU takes the highest-rank remaining. Build a species tableau across rounds.\n\nScoring per tableau:\n- Sum of trait ranks (1-9 each).\n- +10 per trait family with 3+ traits.\n- +15 additional per family with 5+ traits.\n- +5 per same-rank pair; +10 per triplet.\n- +25 if you outscore the CPU.\n\nStrategy: Evolution rewards locking a niche — three Carnivore traits is a +10 even at low ranks. The greedy CPU takes rank-9, leaving mid-tier traits for your set-building. Carnivore-3 in your set beats splashing Pack-8. Aim for 60-100 points. Evolution: Traits Draft is the franchise's adaptation race compressed into eight tense decisions. Adapt or perish.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as EvolutionTraitsSettings),
  reducer,
  isTerminal,
  component: EvolutionTraitsGame,
};
