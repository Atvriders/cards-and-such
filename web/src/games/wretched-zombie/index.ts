import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { WretchedZombieState, WretchedZombieAction, WretchedZombieSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { WretchedZombieGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const wretchedZombiePlugin: GamePlugin<WretchedZombieState, WretchedZombieAction, typeof settings> = {
  id: "wretched-zombie",
  title: "The Wretched Zombie Survivor",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Solo journaling homage; scavenger logs the apocalypse.",
  howToPlay: "The Wretched Zombie Survivor is a solo journaling homage to the Wretched & Alone family, in the style of zombie-apocalypse scavenger games. The original system uses a Jenga tower, dice, and a 52-card deck to drive narrative collapse; this digital homage replaces the dwindling tower with weighted choice-and-roll while preserving the desperate scavenge-and-record tone.\n\nAcross ten survival entries you note where you slept, what you ate, who you met, and what you did when the dead were too close. Each entry offers four weighted choices (A-D); your pick assigns a base reward plus 0-20 of mulberry32 variance.\n\nWrite the entries that nobody else will live to read. The point is not to last forever — the point is that someone, eventually, finds your last page.\n\nLog quietly. The dead hear keystrokes too.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as WretchedZombieSettings),
  reducer, isTerminal, component: WretchedZombieGame,
};
