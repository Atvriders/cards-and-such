import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceBingoMiniState, DiceBingoMiniAction, DiceBingoMiniSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceBingoMini } from "./Game.js";

const diceBingoMiniSettings = {
  rolls: { kind: "enum" as const, label: "Max Rolls", options: ["15", "20"] as const, default: "15" as const },
} as const;

type DiceBingoMiniSettingsType = SettingsOf<typeof diceBingoMiniSettings>;

export const diceBingoMiniPlugin: GamePlugin<DiceBingoMiniState, DiceBingoMiniAction, typeof diceBingoMiniSettings> = {
  id: "dice-bingo-mini",
  title: "Dice Bingo Mini",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Roll a die to mark numbers on your 3x3 bingo card. Complete rows, columns, or diagonals before rolls run out!",
  howToPlay: `Dice Bingo Mini gives you a 3-by-3 bingo card filled with numbers 1 through 9 (each appearing once). Roll a single six-sided die on each turn. If the rolled number appears on your card, it gets marked.

Numbers 7, 8, and 9 cannot be rolled on a standard die — they can only be on your card and will never be marked unless you fill the board another way. This means some cells require you to clear the line with other numbers.

A completed row, column, or diagonal earns 50 bonus points. Each roll also gives you 5 base points. You win early if you complete the card or earn all 4 possible bingos.

The game ends when you reach the maximum number of rolls or complete the card. Your score combines base points and bingo bonuses.

Use Settings to choose 15 or 20 maximum rolls. Get as many bingos as possible! With smart luck and the right card layout, a perfect score of 200+ is within reach.`,
  settings: diceBingoMiniSettings,
  initialState: (seed: number, settings: DiceBingoMiniSettingsType) => initialState(seed, settings as DiceBingoMiniSettings),
  reducer,
  isTerminal,
  hint: (state) => {
    const phase = (state as any).phase;
    if (phase === "rolling") return { selector: '[data-testid="hint-target-dice-bingo-mini-roll"]', pulses: 3 };
    if (phase === "rolling-dice") return { selector: '[data-testid="hint-target-dice-bingo-mini-roll"]', pulses: 3 };
    if (phase === "preRoll") return { selector: '[data-testid="hint-target-dice-bingo-mini-roll"]', pulses: 3 };
    if (phase === "ready") return { selector: '[data-testid="hint-target-dice-bingo-mini-roll"]', pulses: 3 };
    if (phase === "playerRoll") return { selector: '[data-testid="hint-target-dice-bingo-mini-roll"]', pulses: 3 };
    if (phase === "roll") return { selector: '[data-testid="hint-target-dice-bingo-mini-roll"]', pulses: 3 };
    if (phase === "play") return { selector: '[data-testid="hint-target-dice-bingo-mini-roll"]', pulses: 3 };
    if (phase === "playing") return { selector: '[data-testid="hint-target-dice-bingo-mini-roll"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-dice-bingo-mini-roll"]', pulses: 3 };
  },
  component: DiceBingoMini,
};
