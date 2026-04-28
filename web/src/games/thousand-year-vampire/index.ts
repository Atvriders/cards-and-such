import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ThousandYearVampireState, ThousandYearVampireAction, ThousandYearVampireSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ThousandYearVampireGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const thousandYearVampirePlugin: GamePlugin<ThousandYearVampireState, ThousandYearVampireAction, typeof settings> = {
  id: "thousand-year-vampire",
  title: "Thousand Year Vampire",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Solo journaling homage — a vampire records and erases its long memory.",
  howToPlay: "Thousand Year Vampire is a solo journaling homage to Tim Hutchings' acclaimed game where a vampire chronicles its centuries of existence as the past slowly fades. The original is a poetic study of memory, decay, and the long horror of immortality.\n\nAcross ten entries you choose how the vampire responds to events — a forgotten lover, an old promise, a city that has erased itself, a hunger that has changed shape. Each choice (A-D) assigns a base reward plus 0-20 variance through the seeded oracle, modelling the unreliability of vampiric memory.\n\nThere is no win or lose. There is only the chronicle. Some entries score richly because vivid memories endure; others score quietly because they have already begun to slip into mist.\n\nTim Hutchings' original game uses prompts and resources called Memories, Skills, Resources, and Characters. This compact homage reduces all of that to choice and consequence, preserving the somber, beautiful tone.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ThousandYearVampireSettings),
  reducer, isTerminal, component: ThousandYearVampireGame,
};
