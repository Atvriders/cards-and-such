import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { pairsInPearsState, pairsInPearsAction, pairsInPearsSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { pairsInPearsGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const pairsInPearsPlugin: GamePlugin<pairsInPearsState, pairsInPearsAction, typeof settings> = {
  id: "pairs-in-pears",
  title: "Pairs in Pears",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Bananagrams memory variant — make pairs from remembered letter tiles.",
  howToPlay: "Pairs in Pears is a memory game using letter tiles where you spot pairs from a remembered tile set. Each of fifteen rounds presents a clue and four candidate letter pairs to match.\n\nThe pool of letter-pair clues includes Two vowels at start (AB, AE), First and last consonants of CAT (C, T), Both letters in IT (I, T), and various visual or phonemic letter-pair definitions. Each correct answer scores ten points; max 150.\n\nClick a pair to select, press Submit to lock, then Next to advance. No timer means you can carefully picture each pair before deciding. Strong letter-spotters score 130+; alphabetically intuitive players hit perfect 150.\n\nThe original Pairs in Pears uses physical Bananagrams letter tiles in a memory layout where you flip pairs hoping to match phonemic relations. This distillation preserves the letter-pair recognition without the flip-and-match physical mechanic. It's a calm, low-stakes way to drill letter recognition for early readers or as a brain-warm for any age.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as pairsInPearsSettings),
  reducer,
  isTerminal,
  
  hint: (state: pairsInPearsState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-pairs-in-pears-answer-0"]', pulses: 3 } : null,component: pairsInPearsGame,
};
