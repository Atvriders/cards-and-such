import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { WheelSpinState, WheelSpinAction, WheelSpinSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { WheelSpin } from "./Game.js";

const settings = {
  difficulty: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "medium", "hard"] as const,
    default: "medium" as const,
  },
} as const;

export const wheelSpinPlugin: GamePlugin<WheelSpinState, WheelSpinAction, typeof settings> = {
  id: "wheel-spin",
  title: "Wheel Spin",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Spin the wheel for point values, then guess consonants to reveal a hidden word. Buy vowels with your winnings.",
  howToPlay: `Wheel Spin is a word-guessing game inspired by classic TV game shows. Each round a hidden word (from a given category) is displayed as blank tiles. Your goal is to reveal all the letters before running out of wrong guesses.

On your turn you may Spin the Wheel or Buy a Vowel. Spinning costs nothing — the wheel lands on a dollar value (between $100 and $1,000). Once you have a spin value, pick any consonant from the keyboard. If that letter appears in the puzzle, every occurrence is revealed and you earn that dollar amount times the number of letters found. If the letter is not in the puzzle, you get nothing and the wheel resets — spin again on your next turn.

Buying a Vowel costs a flat $250 and reveals all occurrences of the chosen vowel (A, E, I, O, U) immediately. You must have at least $250 to buy a vowel.

At any point (after spinning) you can attempt to solve the full puzzle by typing the word in the Solve box and pressing Enter or the Solve button. A correct solve awards a bonus $500. An incorrect solve counts as a wrong guess.

Run out of wrong-guess allowances and the round is lost — the hidden word is revealed. Complete all rounds and your final score is tallied. Easy mode gives 3 rounds and 8 allowed wrong guesses; Medium gives 5 rounds and 6; Hard gives 7 rounds and 5. Aim to spin big values and guess efficiently to maximize your total score.`,
  settings,
  initialState: (seed: number, s: WheelSpinSettings) => initialState(seed, s),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "done" || p === "gameover" || p === "ended" || p === "finished" || (s as any).gameOver || (s as any).won || (s as any).complete || (s as any).isComplete) return null; return { selector: ".ws-btn", pulses: 3 }; },
  component: WheelSpin,
} as unknown as GamePlugin;
