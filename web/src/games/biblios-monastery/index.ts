import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { BibliosMonasteryState, BibliosMonasteryAction, BibliosMonasterySettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BibliosMonasteryGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const bibliosMonasteryPlugin: GamePlugin<BibliosMonasteryState, BibliosMonasteryAction, typeof settings> = {
  id: "biblios-monastery",
  title: "Biblios: Monastery",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Biblios variant; monks collect illuminated tomes.",
  howToPlay: "Biblios: Monastery is a draft of illuminated tomes across eight rounds. Suits are monastic disciplines — Theology, Astronomy, Botany, and History.\n\nEach round, three cards appear: pick one and the CPU takes the highest-rank remaining. Build a tome library tableau.\n\nScoring per tableau:\n- Sum of card ranks (1-9 each).\n- +10 per discipline with 3+ tomes (collection unlocked).\n- +15 additional per discipline with 5+ tomes (mastery).\n- +5 per same-rank pair; +10 per triplet.\n- +25 if you outscore the CPU.\n\nStrategy: Monastery rewards collection focus — three Theology tomes is +10. The greedy CPU takes the highest rank, leaving mid-tier tomes for your discipline. Theology-2 secures your set faster than splash Botany-8. Aim for 60-100 points. Biblios: Monastery captures the franchise's quiet, cerebral drafting flow. Eight rounds; four disciplines; one monastery.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as BibliosMonasterySettings),
  reducer,
  isTerminal,
  component: BibliosMonasteryGame,
};
