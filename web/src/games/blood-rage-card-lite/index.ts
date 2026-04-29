import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { BloodRageCardLiteState, BloodRageCardLiteAction, BloodRageCardLiteSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BloodRageCardLiteGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const bloodRageCardLitePlugin: GamePlugin<BloodRageCardLiteState, BloodRageCardLiteAction, typeof settings> = {
  id: "blood-rage-card-lite",
  title: "Blood Rage: Card Lite",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Simplified Blood Rage using only draft cards.",
  howToPlay: "Blood Rage: Card Lite is a simplified Blood Rage draft using only the card layer (no minis or board). Eight rounds of Viking ability picks.\n\nEach round, three cards appear: pick one and the CPU takes the highest-rank remaining. Suits are clans — Bear, Wolf, Raven, and Serpent.\n\nScoring per tableau:\n- Sum of card ranks (1-9 each).\n- +10 per clan with 3+ cards (clan bonus).\n- +15 additional per clan with 5+ cards.\n- +5 per same-rank pair; +10 per triplet.\n- +25 if you outscore the CPU at Ragnarok.\n\nStrategy: Blood Rage rewards clan loyalty — three Bear cards earns +10. The greedy CPU will gobble rank-9, but consistent clan-2 picks build your bonuses. Bear-rank-7 may net more than splash Bear-9-Wolf-9-Raven-9. Aim for 60-100 points. Blood Rage: Card Lite is the franchise distilled into eight aggressive draft rounds. Pick your clan, defend your honor, embrace the apocalypse.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as BloodRageCardLiteSettings),
  reducer,
  isTerminal,
  component: BloodRageCardLiteGame,
};
