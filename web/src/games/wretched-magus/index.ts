import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { WretchedMagusState, WretchedMagusAction, WretchedMagusSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { WretchedMagusGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const wretchedMagusPlugin: GamePlugin<WretchedMagusState, WretchedMagusAction, typeof settings> = {
  id: "wretched-magus",
  title: "The Wretched Magus",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Solo journaling homage; apprentice records failed spells.",
  howToPlay: "The Wretched Magus is a solo journaling homage to the Wretched & Alone family, here following an apprentice magic-user keeping a logbook of failed spells, half-learnt sigils, and the small magics that nearly worked. The original Wretched & Alone system uses a Jenga tower and a deck of cards to drive narrative collapse.\n\nThis digital homage replaces the dwindling tower with weighted choice-and-roll while preserving the introspective apprentice-magus tone of doing alchemy in a master's absence.\n\nAcross ten study entries you choose which forbidden text to read, which familiar to scold, which mistake to confess to your master via raven, and which one to never confess. Each entry offers four weighted choices (A-D); your pick assigns a base reward plus 0-20 of mulberry32 variance.\n\nMagic is mostly failure recorded carefully. Failure recorded carelessly is just smoke.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as WretchedMagusSettings),
  reducer, isTerminal, hint: (state: WretchedMagusState): HintTarget | null => (state.phase === "choose" ? { selector: '[data-testid="hint-target-wretched-magus-primary"]', pulses: 3 } : null), component: WretchedMagusGame,
};
