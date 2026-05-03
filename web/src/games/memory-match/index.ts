import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MemoryMatchState, MemoryMatchAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MemoryMatch } from "./MemoryMatch.js";

export const memoryMatchSettings = {
  size: {
    kind: "enum" as const,
    label: "Pairs",
    options: ["6", "8", "12", "18"] as const,
    default: "8" as const,
  },
} as const;

type MemoryMatchSettingsType = SettingsOf<typeof memoryMatchSettings>;

export const memoryMatchPlugin: GamePlugin<MemoryMatchState, MemoryMatchAction, typeof memoryMatchSettings> = {
  id: "memory-match",
  title: "Memory Match",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Flip two cards at a time, find all matching pairs.",
  howToPlay: `Find every matching pair of cards by remembering what you have already seen.

Click any face-down card to flip it over, then click a second face-down card. If the two cards match they stay face-up for the rest of the game. If they do not match, both cards flip back face-down after a brief pause so you can try to remember their positions. Continue until all pairs have been found.

Score on winning is max(100, pairs × 200 − extraAttempts × 20), where extra attempts are any clicks beyond the theoretical minimum of one click per pair. Fewer total clicks means a higher score. Choose from 6, 8, 12, or 18 pairs in settings — more pairs make the grid larger and harder to memorize.

Tips: On your first few turns, flip systematically across the grid rather than randomly so you build a mental map. When you flip a card you have seen before, immediately flip its known match before flipping anything new. Avoid flipping cards you already know are matched.`,
  settings: memoryMatchSettings,
  initialState: (seed: number, settings: MemoryMatchSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (): HintTarget | null => (typeof document !== "undefined" && document.querySelector(".memory-match-grid")) ? { selector: ".memory-match-grid", pulses: 3 } : null,
  component: MemoryMatch,
};
