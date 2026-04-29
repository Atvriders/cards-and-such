import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { SplendorCitiesState, SplendorCitiesAction, SplendorCitiesSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SplendorCitiesGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const splendorCitiesPlugin: GamePlugin<SplendorCitiesState, SplendorCitiesAction, typeof settings> = {
  id: "splendor-cities",
  title: "Splendor: Cities",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Splendor variant; gem-token card draft to build cities.",
  howToPlay: "Splendor: Cities is a Splendor variant where the gem-engine builds entire city districts. Eight rounds of card drafting against a greedy CPU.\n\nEach round, three cards appear: pick one and the CPU takes the highest-rank remaining. Suits are gem types — Diamond, Sapphire, Emerald, and Ruby.\n\nScoring per tableau:\n- Sum of card ranks (1-9 each).\n- +10 per gem type with 3+ cards (district complete).\n- +15 additional per gem type with 5+ cards.\n- +5 per same-rank pair; +10 per triplet.\n- +25 if you outscore the CPU.\n\nStrategy: Cities rewards engine specialization — three Diamond cards earns +10 plus rank totals. The greedy CPU spikes rank-9, opening mid-tier picks for your gem set. Diamond-2 completes a +10; Diamond-2 beats splash Ruby-9 if Diamond-2 completes the set. Aim for 60-100 points. Splendor: Cities is the gem-merchant's longer-term play. Choose carefully; build your district.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SplendorCitiesSettings),
  reducer,
  isTerminal,
  component: SplendorCitiesGame,
};
