import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { IronswornDelveQuestState, IronswornDelveQuestAction, IronswornDelveQuestSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { IronswornDelveQuestGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const ironswornDelveQuestPlugin: GamePlugin<IronswornDelveQuestState, IronswornDelveQuestAction, typeof settings> = {
  id: "ironsworn-delve-quest",
  title: "Ironsworn: Delve",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Solo journaling homage; dungeon-delve oracles for Ironsworn.",
  howToPlay: "Ironsworn: Delve is a solo journaling homage to Shawn Tomkin's Ironsworn: Delve expansion, which adds dangerous-site mechanics to the iron-vow framework — depths to descend, dangers to confront, and themes that color what kind of place each delve is.\n\nAcross ten delve entries you choose how your wanderer enters, advances, and survives a sworn site. Each entry offers four weighted choices (A-D); your pick assigns a base reward plus 0-20 of mulberry32 variance.\n\nThe original Delve uses theme-and-domain pairs, site move tables, and oracle rolls to generate emergent depths. This solo digital homage replaces those tables with weighted prompt-and-roll while preserving the slow, breath-held descent tone of plunging deeper than wisdom would permit.\n\nThe Ironlands hold many old places. The old places hold many older things.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as IronswornDelveQuestSettings),
  reducer, isTerminal, component: IronswornDelveQuestGame,
};
