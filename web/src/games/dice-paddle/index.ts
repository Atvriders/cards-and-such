import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DicePaddleState, DicePaddleAction, DicePaddleSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DicePaddleGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const dicePaddlePlugin: GamePlugin<DicePaddleState, DicePaddleAction, typeof settings> = {
  id: "dice-paddle", title: "Dice Paddle", category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Paddle dice with risk/reward hits. 10 rounds.",
  howToPlay: `Dice Paddle is a risk/reward dice game inspired by paddle-and-ball arcade scoring. Each round, you choose how hard to hit your die: Light, Medium, or Heavy. Then a single d6 is rolled and your score adjusts based on the result.

Light Hit: safe option. Score equals the rolled value, no matter what (1 to 6 points). Average: 3.5 points.

Medium Hit: medium risk. If the die rolls 4, 5, or 6, you score double the rolled value (8, 10, or 12 points). If it rolls 1-3, you score 0. Average: 5 points.

Heavy Hit: high risk. If the die rolls 5 or 6, you score triple the rolled value (15 or 18 points). If it rolls 1-4, you LOSE that many points (the bounce-back penalty). Average: 4.83 points but with high variance.

Score is clamped at zero, so you can't go below. There are 10 rounds. With pure Medium picks you'd average 50 points; with Heavy you'd average 48 but with much wilder swings. Mix it up — the optimal strategy depends on whether you want consistency or fireworks!`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as DicePaddleSettings),
  reducer,
  isTerminal,
  hint: (state: DicePaddleState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "picking") return { selector: '[data-testid="hint-target-dice-paddle-roll"]', pulses: 3 };
    if (state.phase === "result") return { selector: '[data-testid="hint-target-dice-paddle-next"]', pulses: 3 };
    return null;
  },
  component: DicePaddleGame,
};
