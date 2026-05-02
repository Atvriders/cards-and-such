import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceHockeyState, DiceHockeyAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceHockey } from "./Game.js";

export const diceHockeySettings = {
  periods: {
    kind: "enum" as const,
    label: "Periods",
    options: ["2", "3"] as const,
    default: "2" as const,
  },
} as const;

type DiceHockeySettingsType = SettingsOf<typeof diceHockeySettings>;

export const diceHockeyPlugin: GamePlugin<DiceHockeyState, DiceHockeyAction, typeof diceHockeySettings> = {
  id: "dice-hockey",
  title: "Dice Hockey",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Skate, shoot, and block in a dice-driven ice hockey match against an AI goalie.",
  howToPlay: `Dice Hockey simulates an ice hockey match using 2-dice rolls. Play 2 or 3 periods against an AI opponent.

The rink is 11 positions wide (0 = AI net, 10 = your net, 5 = center ice). You start each period at position 5 with the puck. Your goal is to reach position 4 or below and score with a shot.

When you have the puck, three actions are available. Skate rolls 2 dice and advances the puck toward the AI net by at least 1 position. Wrist Shot requires position 5 or closer — roll 2 dice and score on 8 or higher. Slap Shot requires position 4 or closer — harder to reach but scores on 10 or higher, and is faster to execute.

When the AI has the puck, click Block/Steal to attempt an interception by rolling 2 dice — success on 9 or higher gives you possession. Otherwise the AI skates and shoots automatically.

The AI scores a goal if it reaches position 3 with a high roll, then possession resets to center. After each goal the puck resets to center.

A win earns 1000 points, a tie earns 500, and a loss earns 100. Skate aggressively to get into scoring range, then pick the right shot based on your position.`,
  settings: diceHockeySettings,
  initialState: (seed: number, settings: DiceHockeySettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state) => {
    if ((state as any).gameOver) return null;
    const phase = (state as any).phase;
    if (phase === "rolling") return { selector: '[data-testid="hint-target-dice-hockey-play"]', pulses: 3 };
    if (phase === "rolling-dice") return { selector: '[data-testid="hint-target-dice-hockey-play"]', pulses: 3 };
    if (phase === "preRoll") return { selector: '[data-testid="hint-target-dice-hockey-play"]', pulses: 3 };
    if (phase === "ready") return { selector: '[data-testid="hint-target-dice-hockey-play"]', pulses: 3 };
    if (phase === "playerRoll") return { selector: '[data-testid="hint-target-dice-hockey-play"]', pulses: 3 };
    if (phase === "roll") return { selector: '[data-testid="hint-target-dice-hockey-play"]', pulses: 3 };
    if (phase === "play") return { selector: '[data-testid="hint-target-dice-hockey-play"]', pulses: 3 };
    if (phase === "playing") return { selector: '[data-testid="hint-target-dice-hockey-play"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-dice-hockey-play"]', pulses: 3 };
  },
  component: DiceHockey,
};
