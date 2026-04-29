import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ApothecariaSeasonsState, ApothecariaSeasonsAction, ApothecariaSeasonsSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ApothecariaSeasonsGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const apothecariaSeasonsPlugin: GamePlugin<ApothecariaSeasonsState, ApothecariaSeasonsAction, typeof settings> = {
  id: "apothecaria-seasons",
  title: "Apothecaria: Seasons",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Solo journaling homage; village witch's seasonal log.",
  howToPlay: "Apothecaria: Seasons is a solo journaling homage to Sealed Library's Apothecaria, a village-witch RPG in which you forage herbs, brew remedies, and help villagers across the turning of seasons.\n\nAcross ten seasonal entries you choose which patient to receive, which root to harvest, which charm to teach, and which letter to leave unanswered. Each entry offers four weighted choices (A-D); your pick assigns a base reward plus 0-20 of mulberry32 variance.\n\nThe original Apothecaria uses a deck of remedy cards, a herb garden tracking sheet, and a season die. This solo digital homage replaces those props with prompt-and-roll while preserving the gentle, patient-tending pace of being the only healer for a village that does not always thank you.\n\nKeep a kettle warm. Keep your sleeves rolled. Keep recording — even the cures that did not take.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ApothecariaSeasonsSettings),
  reducer, isTerminal, component: ApothecariaSeasonsGame,
};
