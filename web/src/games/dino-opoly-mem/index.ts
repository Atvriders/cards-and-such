import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { dinoOpolyMemState, dinoOpolyMemAction, dinoOpolyMemSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { dinoOpolyMemGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const dinoOpolyMemPlugin: GamePlugin<dinoOpolyMemState, dinoOpolyMemAction, typeof settings> = {
  id: "dino-opoly-mem",
  title: "Dino-Opoly Memory",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Dinosaur-themed property memory — observation cards and trading recall.",
  howToPlay: "Dino-Opoly Memory is a dinosaur-themed observation game distilled to fifteen recognition rounds. Each round presents a dinosaur description and asks you to identify the matching dinosaur from four options.\n\nThe pool of dinosaur-property pairs includes Tyrannosaurus (Massive jaw, two-finger arms), Stegosaurus (Plates along back, spiked tail), Triceratops (Three horns, large neck frill), Velociraptor (Speedy, sickle claw), Brachiosaurus (Long neck, towering height), and other classic dinosaurs. Each correct answer scores ten points; max 150.\n\nClick a dinosaur name, press Submit to lock, then Next to advance. The original Dino-Opoly is a property-trading board game with dinosaur theming and observation-card layers; this distillation preserves the dinosaur-recognition aspect without the Monopoly-style board play. Dino enthusiasts score 130+; paleontology lovers hit perfect 150.\n\nUse it as a dinosaur-knowledge drill or a calm warmup. Read each description, visualise the prehistoric beast, and pick.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as dinoOpolyMemSettings),
  reducer,
  isTerminal,
  hint: (state: dinoOpolyMemState) => {
    if (state.phase === "done") return null;
    return { selector: ".gmem-btn.submit, .gmem-btn.next", pulses: 3 };
  },
  component: dinoOpolyMemGame,
};
