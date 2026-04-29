import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { OceansTraitsState, OceansTraitsAction, OceansTraitsSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { OceansTraitsGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const oceansTraitsPlugin: GamePlugin<OceansTraitsState, OceansTraitsAction, typeof settings> = {
  id: "oceans-traits",
  title: "Oceans: Traits",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Evolution-style card draft; deep ocean unlocks rare traits.",
  howToPlay: "Oceans: Traits is a draft of evolution traits across eight rounds. Each species gains traits represented by the four suits — Predator, Forager, Symbiote, and Migrator.\n\nEach round, three cards appear: pick one and the CPU takes the highest-rank remaining. Build a species tableau.\n\nScoring per tableau:\n- Sum of trait ranks (1-9 each).\n- +10 per trait family with 3+ instances (specialization).\n- +15 additional per trait family with 5+ instances.\n- +5 per same-rank pair; +10 per triplet.\n- +25 if you outscore the CPU.\n\nStrategy: Oceans' deep-ocean traits reward specialization — three Predator cards earns +10. The greedy CPU snatches rank-9, leaving cheaper cards for your specialty. Take Predator-2 over Forager-8 if Predator-2 completes your set. Aim for 60-100 points. Oceans: Traits captures the Evolution-style adaptation race in a compact eight-round draft. Build your species; let the deep ocean reveal its bounty.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as OceansTraitsSettings),
  reducer,
  isTerminal,
  component: OceansTraitsGame,
};
