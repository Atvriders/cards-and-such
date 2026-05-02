import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { DiceArcheryState, DiceArcheryAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceArchery } from "./DiceArchery.js";

export const diceArcheryPlugin = {
  id: "dice-archery",
  title: "Dice Archery",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Roll two dice and see how close to the bullseye your arrow lands — matching dice = perfect shot!",
  howToPlay: `Dice Archery puts you at the archery range with six arrows and two dice. Each shot, roll both dice and look at the difference between them. That difference tells you which ring your arrow hits — a difference of zero (matching dice) is a perfect bullseye worth 100 points!

Scoring: Bullseye (diff 0) = 100 pts; Ring 1 (diff 1) = 80 pts; Ring 2 (diff 2) = 60 pts; Ring 3 (diff 3) = 40 pts; Ring 4 (diff 4) = 20 pts; Miss (diff 5) = 0 pts.

You fire six arrows total. With a maximum possible score of 600 you are aiming for the highest total you can achieve. Rolling matching dice is the key — the chance of that happening is 6 out of 36 rolls, so celebrate every bullseye!

The target on screen highlights the ring your arrow just struck. Watch your score accumulate as the arrows fly. After the sixth arrow the game tallies your final total and you can start a fresh round with a new seed. Pure chance, instant satisfaction!`,
  settings: {} as Record<string, never>,
  initialState: (seed: number) => initialState(seed),
  reducer,
  isTerminal,
  hint: (state) => {
    if ((state as any).gameOver) return null;
    return { selector: '[data-testid="hint-target-dice-archery-shoot"]', pulses: 3 };
  },
  component: DiceArchery,
} as unknown as GamePlugin;
