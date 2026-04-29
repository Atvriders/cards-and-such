import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { blinkItFlashState, blinkItFlashAction, blinkItFlashSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { blinkItFlashGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const blinkItFlashPlugin: GamePlugin<blinkItFlashState, blinkItFlashAction, typeof settings> = {
  id: "blink-it-flash",
  title: "Blink It",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Fast-reaction matching — first to spot colour-and-number match wins.",
  howToPlay: "Blink It is a fast-reaction matching game distilled to fifteen visual-recognition rounds. Each round shows a centre card and asks you to identify which adjacent card matches by colour or number.\n\nThe pool of card-match challenges includes Centre red 4 / matches red 3, Centre blue 7 / matches green 7, Centre yellow 2 / matches yellow 5, and similar colour-or-number alignments. Each correct answer scores ten points; max 150.\n\nClick a matching card, press Submit to lock, then Next to advance. The original Blink It is a 2-4 player race to spot matches first; this distillation removes the speed-race component while preserving the matching-recognition focus. Strong matchers score 130+; sharp eyes hit perfect 150.\n\nUse it as a focus warmup or as a calmer single-player version of the live-card race. The key skill is rapid colour-recognition combined with number-comparison — both can match, but only one rule needs to hold.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as blinkItFlashSettings),
  reducer,
  isTerminal,
  component: blinkItFlashGame,
};
