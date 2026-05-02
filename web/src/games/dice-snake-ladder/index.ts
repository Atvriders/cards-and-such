import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceSnakeLadderState, DiceSnakeLadderAction, DiceSnakeLadderSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceSnakeLadderGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceSnakeLadderPlugin: GamePlugin<DiceSnakeLadderState, DiceSnakeLadderAction, typeof settings> = {
  id:"dice-snake-ladder", title:"Dice Snake & Ladder", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Mini snakes & ladders: roll a die, climb to 30 in as few rolls as possible.",
  howToPlay:`Dice Snake & Ladder is a tiny solo race to square 30 on a single-die board. Each roll moves you forward 1-6 spaces. If you'd overshoot 30, you bounce back to your previous square — exact landing required.

Special tiles change everything:
— Ladders: Squares 4 → 11, 9 → 20, 21 → 28 boost you up the board.
— Snakes: Squares 12 → 5, 18 → 8, 24 → 14 send you backwards.

Your final score is calculated when you reach 30: it's max(10, 100 minus 5 per roll). So 10 rolls scores 50; 12 rolls scores 40; 18+ rolls bottoms out at 10.

Speed-run skill matters less than ladder luck. A perfect 9-roll finish (using both 9→20 and 21→28 ladders) scores 55. Average finishes take 14-18 rolls and score 20-35. Avoid those snakes near the end!

Press Roll to advance. There's no choice — purely a sprint to the goal.`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceSnakeLadderSettings),
  reducer,isTerminal,
  hint: (state: any) => { if ((state as any).phase === "gameover" || (state as any).gameOver) return null; return { selector: '[data-testid="hint-target-dice-snake-ladder-roll"]', pulses: 3 }; },
  component:DiceSnakeLadderGame,
};
