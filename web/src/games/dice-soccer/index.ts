import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceSoccerState, DiceSoccerAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceSoccer } from "./Game.js";

export const diceSoccerSettings = {
  halves: {
    kind: "enum" as const,
    label: "Halves",
    options: ["2", "4"] as const,
    default: "2" as const,
  },
} as const;

type DiceSoccerSettingsType = SettingsOf<typeof diceSoccerSettings>;

export const diceSoccerPlugin: GamePlugin<DiceSoccerState, DiceSoccerAction, typeof diceSoccerSettings> = {
  id: "dice-soccer",
  title: "Dice Soccer",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Roll dice to dribble and shoot against an AI goalkeeper in this tabletop soccer game.",
  howToPlay: `Dice Soccer simulates a fast-paced football match using dice rolls. You play against an AI opponent across 2 or 4 halves.

The pitch has 11 positions (0 = AI goal, 10 = your goal, 5 = center). Ball position is shown on the pitch strip. At kickoff you start in control at position 5.

On your turn you choose an action. Dribble rolls 2 dice and advances the ball by the sum minus 5 (can be negative). Reach position 0 or below to score. Shoot requires position 6 or higher — roll 2 dice and score if the sum is 9 or more. A missed shot gives the AI the ball. Defend attempts to intercept — roll 2 dice and win the ball if the sum is 8 or more.

After each player action the AI automatically makes its move — it dribbles towards your goal and shoots when in range. Click Defend/Intercept when the AI has possession to try to take the ball.

Scoring: win earns 1000 points, draw earns 500, loss earns 100. Manage ball position strategically — dribble close before shooting and defend aggressively when the AI is threatening.`,
  settings: diceSoccerSettings,
  initialState: (seed: number, settings: DiceSoccerSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state) => {
    if ((state as any).gameOver) return null;
    const phase = (state as any).phase;
    if (phase === "rolling") return { selector: '[data-testid="hint-target-dice-soccer-play"]', pulses: 3 };
    if (phase === "rolling-dice") return { selector: '[data-testid="hint-target-dice-soccer-play"]', pulses: 3 };
    if (phase === "preRoll") return { selector: '[data-testid="hint-target-dice-soccer-play"]', pulses: 3 };
    if (phase === "ready") return { selector: '[data-testid="hint-target-dice-soccer-play"]', pulses: 3 };
    if (phase === "playerRoll") return { selector: '[data-testid="hint-target-dice-soccer-play"]', pulses: 3 };
    if (phase === "roll") return { selector: '[data-testid="hint-target-dice-soccer-play"]', pulses: 3 };
    if (phase === "play") return { selector: '[data-testid="hint-target-dice-soccer-play"]', pulses: 3 };
    if (phase === "playing") return { selector: '[data-testid="hint-target-dice-soccer-play"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-dice-soccer-play"]', pulses: 3 };
  },
  component: DiceSoccer,
};
