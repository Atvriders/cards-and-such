import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceFootballState, DiceFootballAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceFootball } from "./Game.js";

export const diceFootballSettings = {
  quarters: {
    kind: "enum" as const,
    label: "Quarters",
    options: ["2", "4"] as const,
    default: "2" as const,
  },
} as const;

type DiceFootballSettingsType = SettingsOf<typeof diceFootballSettings>;

export const diceFootballPlugin: GamePlugin<DiceFootballState, DiceFootballAction, typeof diceFootballSettings> = {
  id: "dice-football",
  title: "Dice Football",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Call plays and roll dice to drive down the field and outscore the AI.",
  howToPlay: `Dice Football simulates a simplified gridiron game using dice rolls. You call plays for your offense while the AI handles its own turns automatically.

On your turn, choose one of three play types. A Run rolls 2 dice — the sum minus 2 is your yards gained (can be negative if tackled for a loss). A Pass rolls 3 dice — if the total is 9 or more, it's a completion and you gain total minus 4 yards; below 9 is incomplete for 0 yards. A Field Goal rolls 2 dice — success requires a sum of 7 or more AND being past your own 30-yard line; it scores 3 points.

Advancing past the opponent's goal line (yard 100) scores a touchdown worth 7 points. Gain 10 yards in 4 downs for a first down. Fail to do so and the AI gets the ball.

After each of your plays, the AI automatically runs its own offensive sequence. Click "Continue" when it is the AI's turn to advance the game.

Score: 1000 for a win, 500 for a tie, 100 for a loss.`,
  settings: diceFootballSettings,
  initialState: (seed: number, settings: DiceFootballSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state) => {
    if ((state as any).gameOver) return null;
    const phase = (state as any).phase;
    if (phase === "rolling") return { selector: '[data-testid="hint-target-dice-football-play"]', pulses: 3 };
    if (phase === "rolling-dice") return { selector: '[data-testid="hint-target-dice-football-play"]', pulses: 3 };
    if (phase === "preRoll") return { selector: '[data-testid="hint-target-dice-football-play"]', pulses: 3 };
    if (phase === "ready") return { selector: '[data-testid="hint-target-dice-football-play"]', pulses: 3 };
    if (phase === "playerRoll") return { selector: '[data-testid="hint-target-dice-football-play"]', pulses: 3 };
    if (phase === "roll") return { selector: '[data-testid="hint-target-dice-football-play"]', pulses: 3 };
    if (phase === "play") return { selector: '[data-testid="hint-target-dice-football-play"]', pulses: 3 };
    if (phase === "playing") return { selector: '[data-testid="hint-target-dice-football-play"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-dice-football-play"]', pulses: 3 };
  },
  component: DiceFootball,
};
