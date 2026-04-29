import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BrainbowState, BrainbowAction, BrainbowSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BrainbowGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const brainbowPlugin: GamePlugin<BrainbowState, BrainbowAction, typeof settings> = {
  id: "brainbow", title: "Brainbow", category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Pick panel with colors in correct rainbow order.",
  howToPlay: "Brainbow tests rainbow-color sequence recall. Each of twelve rounds asks you to pick the panel showing three rainbow colors in correct ROYGBIV order starting from a specified color. The seven-color rainbow is red, orange, yellow, green, blue, indigo, violet. Each round picks a starting color (red through blue) and the correct three-color sequence runs from there in order ('yellow then green then blue', for example). Three distractor panels show the same three colors in shuffled order. Tap the correctly-ordered panel, hit Submit, score ten points. Twelve rounds, max 120 points. Brainbow is calibrated for color-vocabulary fluency: you need to know the rainbow order plus quickly verify three-element sequences against it. Children studying ROYGBIV for the first time score 70-100; adults score 100-120. The mnemonic 'Roy G Biv' helps. Hit Submit to lock and Next to advance through all twelve rounds.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as BrainbowSettings),
  reducer, isTerminal, component: BrainbowGame,
};
