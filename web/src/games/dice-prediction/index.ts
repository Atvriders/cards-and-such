import type { GamePlugin } from "../../platform/game-plugin/types.js";
import { initialState, reducer, isTerminal, type DicePredictionState, type DicePredictionAction } from "./state.js";
import { DicePrediction } from "./DicePrediction.js";

export const dicePredictionSettings = {
  rounds: { kind: "enum" as const, label: "Rounds", options: ["5", "10", "15"] as const, default: "5" as const },
} as const;

export const dicePredictionPlugin: GamePlugin<DicePredictionState, DicePredictionAction, typeof dicePredictionSettings> = {
  id: "dice-prediction",
  title: "Dice Prediction",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Predict which face the die will land on before each roll.",
  howToPlay: `Dice Prediction is a simple one-player guessing game. Each round, you must predict which face (1 through 6) a standard six-sided die will land on before you roll it.

Click one of the six die faces to make your prediction. The selected face is highlighted. Then click Roll to reveal the result. If you guessed correctly, you earn 100 points and the result glows green. A wrong guess glows red and earns nothing.

After seeing the result, click Next to move to the next round. The game lasts 5, 10, or 15 rounds depending on your settings. A perfect game scores 500, 1000, or 1500 points respectively.

Each die roll is completely independent — there is no pattern, streak, or bias. Each face has exactly a 1-in-6 chance every roll. No strategy improves your odds; this is pure prediction luck.

The history row at the bottom shows die icons for completed rounds — green for correct, red for wrong. It's a fun reminder of how probability plays out in real life.

Tips: some players swear by always picking the same number; others try to "chase" rolls. Mathematically neither approach changes your expected score. Just enjoy the tension of each reveal — and hope luck is on your side!`,
  settings: dicePredictionSettings,
  initialState,
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-dice-prediction-action"]', pulses: 3 }; },
  component: DicePrediction,
};
