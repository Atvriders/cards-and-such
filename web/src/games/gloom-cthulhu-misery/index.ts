import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { gloomCthulhuMiseryState, gloomCthulhuMiseryAction, gloomCthulhuMiserySettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { gloomCthulhuMiseryGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const gloomCthulhuMiseryPlugin: GamePlugin<gloomCthulhuMiseryState, gloomCthulhuMiseryAction, typeof settings> = {
  id: "gloom-cthulhu-misery",
  title: "Gloom: Cthulhu",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Lovecraftian Gloom — fifteen misery-recognition card identifications.",
  howToPlay: "Gloom: Cthulhu is the cosmic-horror version of Gloom, distilled to fifteen misery-recognition rounds. Each round presents a misery card description and asks you to identify the matching misery type from four options.\n\nThe pool of cosmic-misery cards includes Tentacled Encounter (Lost sanity in dreams), Forbidden Tome Read (Mind unraveled), Cult Initiation (Sacrificed to Old Ones), Ancient Ruins Visited (Awakened the sleeping), Cosmic Vision (Reality fractured), and other Lovecraftian misery types. Each correct answer scores ten points; max 150.\n\nClick a misery type, press Submit to lock, then Next to advance. The original Gloom: Cthulhu uses transparent overlay cards that stack visually for misery-scoring; this distillation preserves the card-identification aspect without the physical overlay layer. Lovecraft enthusiasts score 130+; cosmic-horror fans hit perfect 150.\n\nUse it as a quick noir-RPG warmup or a calm cosmic-horror brainteaser. Read the misery, picture the cosmic agony, and pick.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as gloomCthulhuMiserySettings),
  reducer,
  isTerminal,
  component: gloomCthulhuMiseryGame,
};
