import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceMirrorRollState, DiceMirrorRollAction, DiceMirrorRollSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceMirrorRoll } from "./Game.js";

const diceMirrorRollSettings = {
  rounds: { kind: "enum" as const, label: "Rounds", options: ["8", "10", "12"] as const, default: "10" as const },
} as const;

type S = SettingsOf<typeof diceMirrorRollSettings>;

export const diceMirrorRollPlugin: GamePlugin<DiceMirrorRollState, DiceMirrorRollAction, typeof diceMirrorRollSettings> = {
  id: "dice-mirror-roll",
  title: "Dice Mirror Roll",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "A die is rolled and shown. Predict whether the next roll will be higher, lower, or the same — same is rare but pays 60 points!",
  howToPlay: `Dice Mirror Roll is a prediction game based on sequential dice rolls. Each round a die is rolled and its value is shown to you. You must then predict the outcome of the NEXT roll of the same die.

Predict Higher (next roll is 1-5 when showing a 6 is impossible, etc.) and be right to earn 25 points. Predict Lower and be right for 25 points. Or dare to call SAME — if both dice match, you earn a generous 60 points! But same only happens 1 in 6 times.

After your bet, the next die rolls and the result is revealed. Press Next to continue — the previous roll becomes the new starting die for the next round. This creates an interesting chain where lucky rolls can put you in favourable positions.

Use Settings to choose 8, 10, or 12 rounds. Final score is shown at the end. Play it safe with higher/lower, or gamble on same for the big payoff?`,
  settings: diceMirrorRollSettings,
  initialState: (seed: number, s: S) => initialState(seed, s as DiceMirrorRollSettings),
  reducer, isTerminal, 
  hint: (state: any) => {
    if ((state as any).phase === "gameover" || (state as any).gameOver) return null;
    if ((state as any).phase === "reveal") return { selector: '[data-testid="hint-target-dice-mirror-roll-next"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-dice-mirror-roll-roll"]', pulses: 3 };
  },
  component: DiceMirrorRoll,
};
