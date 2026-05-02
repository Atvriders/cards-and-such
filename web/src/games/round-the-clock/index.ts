import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { RoundTheClockState, RoundTheClockAction, RoundTheClockSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { RoundTheClock } from "./Game.js";

export const roundTheClockSettings = {
  skill: {
    kind: "enum" as const,
    label: "Skill Level",
    options: ["beginner", "amateur", "pro"] as const,
    default: "amateur",
  },
} as const;

export const roundTheClockPlugin: GamePlugin<RoundTheClockState, RoundTheClockAction, typeof roundTheClockSettings> = {
  id: "round-the-clock",
  title: "Round the Clock Darts",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Hit 1 through 20 then Bullseye in order. Simulated darts with realistic hit probabilities.",
  howToPlay: `Round the Clock is a classic darts training game. Your goal is to hit each number on the dartboard in order — 1, 2, 3, all the way to 20, and finally the Bullseye (25) — before your patience runs out!

Each turn you throw three darts aimed at the current target number. The game simulates the throws based on your skill level: Beginner hits the target about 50% of the time per dart, Amateur about 65%, and Pro about 80%. Occasionally a dart clips a neighboring number instead of the target, and sometimes it misses entirely.

You only advance to the next target once you hit the current one during a turn — but all three darts are thrown regardless. That means a lucky turn can keep you from wasting extra turns on a hard number.

Click "Throw 3 Darts" to simulate your turn, then click "Next Turn" to proceed. A green checkmark means that number is done; a blue circle shows your current target.

Skill level can be set before starting a game in Settings. Pro mode gets through the board fastest; Beginner can take many turns on each number.

Score = max(100, 2000 − total throws × 10). Fewer total throws across all 21 targets gives a higher score.`,
  settings: roundTheClockSettings,
  initialState: (seed: number, s: RoundTheClockSettings) => initialState(seed, s),
  reducer,
  isTerminal,
  hint: (state: RoundTheClockState): HintTarget | null => state.won ? null : (state.pendingThrows.length > 0 ? { selector: '[data-testid="next-turn"]', pulses: 3 } : { selector: '[data-testid="throw-darts"]', pulses: 3 }),
  component: RoundTheClock,
};
