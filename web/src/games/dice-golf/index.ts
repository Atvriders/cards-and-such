import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceGolfState, DiceGolfAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceGolf } from "./DiceGolf.js";

export const diceGolfSettings = {
  holes: {
    kind: "enum" as const,
    label: "Holes",
    options: ["9", "18"] as const,
    default: "9",
  },
} as const;

type DiceGolfSettingsType = SettingsOf<typeof diceGolfSettings>;

export const diceGolfPlugin: GamePlugin<DiceGolfState, DiceGolfAction, typeof diceGolfSettings> = {
  id: "dice-golf",
  title: "Dice Golf",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Play a 9 or 18 hole round of golf simulated entirely with two dice — go for under par!",
  howToPlay: `Dice Golf simulates a full round of golf using two dice. Play 9 or 18 holes, each with a par of 3, 4, or 5. Your goal is to complete each hole in as few strokes as possible — just like real golf.

On each turn click "Take Shot" to roll two dice. The sum determines your shot outcome: sum of 2 or 12 is a Hole in One (you're done in a single stroke!); sum of 3–4 is a Power Shot that advances you two spots toward the hole; sum of 5–8 is a Normal Shot (one spot advance); sum of 9–11 sends you into the Rough — you still advance one spot but receive a one-stroke penalty; sum of 12 is a Perfect Drive that advances three spots with no penalty.

Each hole needs as many advances as its par number to complete it. A par-4 hole needs 4 advances. Finishing in fewer strokes earns birdies and eagles; going over par gives bogeys and double bogeys. Your scorecard tracks every hole.

Final score is 500 minus 10 for every stroke you are over par (floored at 0). Consistent birdies can push your score well above 500 if you get lucky. Good luck on the links!`,
  settings: diceGolfSettings,
  initialState: (seed: number, settings: DiceGolfSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state) => {
    if ((state as any).gameOver) return null;
    return { selector: '[data-testid="hint-target-dice-golf-roll"]', pulses: 3 };
  },
  component: DiceGolf,
};
