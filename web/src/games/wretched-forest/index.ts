import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { WretchedForestState, WretchedForestAction, WretchedForestSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { WretchedForestGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const wretchedForestPlugin: GamePlugin<WretchedForestState, WretchedForestAction, typeof settings> = {
  id: "wretched-forest",
  title: "The Wretched Forest",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Solo journaling homage; last survivor in cursed woods.",
  howToPlay: "The Wretched Forest is a solo journaling homage to the Wretched & Alone family, here following the cursed-forest variant where the last survivor of a forgotten village records nightly entries in the deepening woods. The original tower-block fate mechanic drives a slow collapse; this digital homage preserves the dwindling-hope tone via weighted choice-and-roll.\n\nAcross ten dusk entries you choose what to forage, what to burn, what to listen for, and what to carve into the bark. Each entry offers four choices (A-D); your pick assigns a base reward plus 0-20 of mulberry32 variance.\n\nThe forest is older than the village, older than the names of its trees. Your log will not save you, but it may save someone who finds it.\n\nWrite by the firelight. Listen for footsteps that should not be there. Carve a sigil before sleep — the dawn does not always come.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as WretchedForestSettings),
  reducer, isTerminal, hint: (state: WretchedForestState): HintTarget | null => (state.phase === "choose" ? { selector: '[data-testid="hint-target-wretched-forest-primary"]', pulses: 3 } : null), component: WretchedForestGame,
};
