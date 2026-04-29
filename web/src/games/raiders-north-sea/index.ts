import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { RaidersNorthSeaState, RaidersNorthSeaAction, RaidersNorthSeaSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { RaidersNorthSeaGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const raidersNorthSeaPlugin: GamePlugin<RaidersNorthSeaState, RaidersNorthSeaAction, typeof settings> = {
  id: "raiders-north-sea",
  title: "Raiders of the North Sea",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Draft-place-seize worker turn; Viking raiding party.",
  howToPlay: "Raiders of the North Sea is a Viking-raid draft across eight rounds. Suits are warrior types — Berserker, Skald, Shieldmaiden, and Jarl.\n\nEach round, three cards appear: pick one and the CPU takes the highest-rank remaining. Build a raiding party tableau.\n\nScoring per tableau:\n- Sum of warrior ranks (1-9 each).\n- +10 per warrior type with 3+ in party.\n- +15 additional per type with 5+ in party.\n- +5 per same-rank pair; +10 per triplet.\n- +25 if you outscore the CPU.\n\nStrategy: Raiders rewards specialized warbands — three Berserkers earns +10. The greedy CPU snatches rank-9, leaving mid-tier warriors for your set. Berserker-2 secures your set faster than splashing Skald-9. Aim for 60-100 points. Raiders of the North Sea condenses the place-and-draft worker mechanic into eight raid-pick rounds. Choose your warriors; sail north; plunder.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as RaidersNorthSeaSettings),
  reducer,
  isTerminal,
  component: RaidersNorthSeaGame,
};
