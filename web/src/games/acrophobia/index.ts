import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { AcrophobiaState, AcrophobiaAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Acrophobia } from "./Acrophobia.js";

export const acrophobiaSettings = {
  difficulty: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "hard"] as const,
    default: "easy" as const,
  },
} as const;

type AcrophobiaSettingsType = SettingsOf<typeof acrophobiaSettings>;

export const acrophobiaPlugin: GamePlugin<AcrophobiaState, AcrophobiaAction, typeof acrophobiaSettings> = {
  id: "acrophobia",
  title: "Acrophobia",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Decode an acronym by guessing the words of the hidden phrase.",
  howToPlay: `Acrophobia presents you with an acronym such as TGIF or ASAP. Your task is to guess the canonical phrase that each letter stands for.

Each letter of the acronym corresponds to a word. You fill in one word per slot. The word you type does not have to match exactly — if the first letter of your word matches the first letter of the canonical word, that slot is scored as correct. Getting all first letters right wins the round. Typing the exact canonical word in every slot earns bonus points.

Use the Tab key to move to the next slot, Shift+Tab for the previous slot, and Enter to submit your answer. You can also click any slot to focus it. Type freely; words can include spaces if needed.

Scoring: 500 points for an exact match, 50 points per correct first letter. Each game has 5 rounds with different phrases. Your total score accumulates across rounds.

Easy mode shows the letter count of each canonical word, giving you a helpful hint about word length. Hard mode shows only the acronym.

Tips: think about common phrases first — many acronyms come from everyday language or tech. If you're stuck, focus on unusual letters like Q, X, or Z and brainstorm what common words start with them in context.`,
  settings: acrophobiaSettings,
  initialState: (seed: number, settings: AcrophobiaSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "done" || p === "gameover" || p === "ended" || p === "finished" || (s as any).gameOver || (s as any).won || (s as any).complete || (s as any).isComplete) return null; return { selector: ".acro-btn", pulses: 3 }; },
  component: Acrophobia,
};
