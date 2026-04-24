import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CipherCrackState, CipherCrackAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CipherCrackGame } from "./Game.js";

const cipherCrackSettings = {
  length: {
    kind: "enum" as const,
    label: "Message length",
    options: ["short", "medium", "long"] as const,
    default: "medium" as const,
  },
} as const;

type S = SettingsOf<typeof cipherCrackSettings>;

export const cipherCrackPlugin: GamePlugin<CipherCrackState, CipherCrackAction, typeof cipherCrackSettings> = {
  id: "cipher-crack",
  title: "Cipher Crack",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Decode a simple substitution cipher by mapping each cipher letter to its plaintext equivalent.",
  howToPlay: `Cipher Crack presents an encoded message. Each letter of the original message has been replaced by a different letter using a secret one-to-one substitution: every A might become Q, every B might become X, and so on. Spaces are preserved, but punctuation is not.

Your task is to figure out the original message by assigning a plaintext letter to each cipher letter. For each unique cipher letter shown, type the letter you believe it represents in the box below it. The decoded message updates live as you make assignments.

You win when every cipher letter has been correctly mapped to its true plaintext letter.

Three message lengths are available: Short (2–3 short words), Medium (a common phrase of 4–6 words), and Long (a well-known sentence of 8–12 words). Longer messages give more statistical data to work with.

Score starts at 1000 and decreases by 10 per guess (including corrections), floor 100.

Tips for solving substitution ciphers: single-letter words must be A or I. The most common letters in English are E, T, A, O, I, N. Three-letter groups that appear often are likely THE, AND, or FOR. Look at word lengths and repeated patterns — if the same cipher letter appears at the start of many words, it is probably a common initial such as T or S.`,
  settings: cipherCrackSettings,
  initialState: (seed: number, settings: S) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: CipherCrackGame,
};
