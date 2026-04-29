import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { LibertaliaGalecrestState, LibertaliaGalecrestAction, LibertaliaGalecrestSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { LibertaliaGalecrestGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const libertaliaGalecrestPlugin: GamePlugin<LibertaliaGalecrestState, LibertaliaGalecrestAction, typeof settings> = {
  id: "libertalia-galecrest",
  title: "Libertalia: Galecrest",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Simultaneous role-card reveal for pirate plunder; skyship theme.",
  howToPlay: "Libertalia: Galecrest is a pirate-skyship draft over eight rounds. Suits are crew roles — Captain, Quartermaster, Gunner, and Cook.\n\nEach round, three cards appear: pick one and the CPU takes the highest-rank remaining. Build a crew tableau.\n\nScoring per tableau:\n- Sum of crew ranks (1-9 each).\n- +10 per role with 3+ crew.\n- +15 additional per role with 5+ crew.\n- +5 per same-rank pair; +10 per triplet.\n- +25 if you outscore the CPU.\n\nStrategy: Libertalia rewards crew specialization — three Captains is a +10 even at low ranks. The greedy CPU takes rank-9, leaving mid-tier crew for your specialty. Quartermaster-3 can complete your set, beating splash Captain-9. Aim for 60-100 points. Libertalia: Galecrest distills the simultaneous-reveal mayhem into a tight drafting flow. Hire your crew, plunder the skies, and outscore the rival captain.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as LibertaliaGalecrestSettings),
  reducer,
  isTerminal,
  component: LibertaliaGalecrestGame,
};
