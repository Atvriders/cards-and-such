import type { GamePlugin } from "../../platform/game-plugin/types.js";
import { initialState, reducer, isTerminal, type HexColorGuessState, type HexColorGuessAction } from "./state.js";
import { HexColorGuess } from "./HexColorGuess.js";

export const hexColorGuessSettings = {
  rounds: { kind: "enum" as const, label: "Rounds", options: ["5", "10", "15"] as const, default: "5" as const },
} as const;

export const hexColorGuessPlugin: GamePlugin<HexColorGuessState, HexColorGuessAction, typeof hexColorGuessSettings> = {
  id: "hex-color-guess",
  title: "Hex Color Guess",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "See a color swatch and pick the matching hex code from four options.",
  howToPlay: `Hex Color Guess tests your knowledge of web color codes. Each round, a colored square is displayed on screen. You must identify which of four hex codes (like #3fa2c1) matches that exact color.

Hex color codes describe colors using red, green, and blue channels. Each pair of digits after the # is a hex value from 00 (none) to ff (full). For example, #ff0000 is pure red, #00ff00 is pure green, and #0000ff is pure blue. Darker colors have lower values; brighter colors have higher ones.

When you select an answer, the correct hex is highlighted in green. Wrong guesses are crossed out in red. The game immediately moves to the next round.

You score 100 points for each correct answer. With 5, 10, or 15 rounds depending on your settings, a perfect run scores 500, 1000, or 1500 points.

Tips: start by looking at the dominant channel. Is the color reddish, greenish, or bluish? Then look at brightness — dark colors have two-digit hex values in the 00–55 range; bright colors are in the aa–ff range. With practice, you'll learn to recognize common hex patterns quickly.

This game sharpens practical web development skills and trains your eye for color.`,
  settings: hexColorGuessSettings,
  initialState,
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-hex-color-guess-action"]', pulses: 3 }; },
  component: HexColorGuess,
};
