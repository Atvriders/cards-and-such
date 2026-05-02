import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { diceForgeCraftState, diceForgeCraftAction, diceForgeCraftSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { diceForgeCraftGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const diceForgeCraftPlugin: GamePlugin<diceForgeCraftState, diceForgeCraftAction, typeof settings> = {
  id: "dice-forge-craft",
  title: "Dice Forge",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Craft custom dice faces — roll resources and defeat monsters via 4x4 grid.",
  howToPlay: "Dice Forge is a die-crafting roll-and-write distilled to a 4x4 forge grid. Each cell represents a custom die face; inscribing a value forges that face into your personal die.\n\nPress Roll to receive an ingot value (1-6). Click any unmarked cell to forge that face into the cell, scoring 2 base points. Twelve forge cycles per game.\n\nCompleting a row earns the Solar Forge bonus (+5), a column the Lunar Forge bonus (+5), and the full grid (sixteen cells) the +10 Mythic Forge bonus. Skipping a forge cycle costs nothing but burns one of twelve precious turns.\n\nThe original Dice Forge has rotating die faces, hero powers, and direct combat — this distillation preserves the iterative die-customisation pleasure without the combat layer. Solid runs score 30-45; tight grid-fillers hit 50+.\n\nEvery cell forged is a face on your eternal die; choose where the bright values go, and where the lower numbers fall as filler — they all matter when the grid completes.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as diceForgeCraftSettings),
  reducer,
  isTerminal,
  hint: (state: diceForgeCraftState): HintTarget | null => {
  if (isTerminal(state)) return null;
  if (state.phase === "rolling") return { selector: '[data-testid="hint-target-dice-forge-craft-roll"]', pulses: 3 };
  return null;
  },
  component: diceForgeCraftGame,
};
