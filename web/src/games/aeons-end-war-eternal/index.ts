import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { AeonsEndWarEternalState, AeonsEndWarEternalAction, AeonsEndWarEternalSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { AeonsEndWarEternalGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const aeonsEndWarEternalPlugin: GamePlugin<AeonsEndWarEternalState, AeonsEndWarEternalAction, typeof settings> = {
  id: "aeons-end-war-eternal",
  title: "Aeon's End War Eternal",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Standalone Aeon's End expansion; new mages and nemeses.",
  howToPlay: "Aeon's End War Eternal is a ten-round cooperative dice tribute to Indie Boards & Cards' Aeon's End: War Eternal, the standalone expansion adding new mages and nemeses. You and an AI mage ally roll dice each round to defeat the latest nemesis. Team target is 70 across 10 rounds. 🌑\n\nEach round both dice are rolled and summed, contributing to your team score. Reach 70 by round 10 and the nemesis is banished with a +50 mage-bond bonus. Per-round averages around 7 mean ten rounds typically reach the target with margin.\n\nPress Play Round to roll, Next Round to advance, and Finish on round 10. The game completes in well under a minute. It distills War Eternal's cooperative mage-defence drama into a compact pocket session — perfect for a brief cooperative experience that captures the original's signature no-shuffle deck flavour even after abstraction.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as AeonsEndWarEternalSettings),
  reducer, isTerminal, component: AeonsEndWarEternalGame,
};
