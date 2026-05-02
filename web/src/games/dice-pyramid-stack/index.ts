import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DicePyramidStackState, DicePyramidStackAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DicePyramidStack } from "./DicePyramidStack.js";
export const dicePyramidStackSettings = { rounds: { kind: "enum" as const, label: "Rounds", options: ["5","10","15"] as const, default: "10" as const } } as const;
type S = SettingsOf<typeof dicePyramidStackSettings>;
export const dicePyramidStackPlugin: GamePlugin<DicePyramidStackState, DicePyramidStackAction, typeof dicePyramidStackSettings> = {
  id: "dice-pyramid-stack", title: "Dice Pyramid Stack", category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Bank dice values into a growing pyramid to earn row multiplier bonuses.",
  howToPlay: `Dice Pyramid Stack is a decision-based dice game. Each round you roll three dice and must choose one to bank into your growing pyramid. The banked die's value earns a row-multiplier bonus — the deeper your pyramid, the higher the bonus. Each banked die is worth: value × (current pyramid height + 1). So a 6 banked as your 5th row earns 6 × 5 = 30 points! After banking, roll the next set. Play for 5, 10, or 15 rounds. Tips: Always bank the highest die to maximize your row bonus. As the pyramid grows, each subsequent die adds more value. Prioritize 5s and 6s in later rounds.`,
  settings: dicePyramidStackSettings,
  initialState: (seed: number, settings: S) => initialState(seed, settings),
  reducer, isTerminal, 
  hint: (state: any) => { if ((state as any).phase === "gameover" || (state as any).gameOver) return null; return { selector: '[data-testid="hint-target-dice-pyramid-stack-roll"]', pulses: 3 }; },
  component: DicePyramidStack,
};
