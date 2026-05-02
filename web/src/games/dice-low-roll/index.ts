import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceLowRollState, DiceLowRollAction, DiceLowRollSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceLowRollGame } from "./Game.js";
const settings = { rounds: { kind:"enum" as const, label:"Rounds", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const diceLowRollPlugin: GamePlugin<DiceLowRollState, DiceLowRollAction, typeof settings> = {
  id: "dice-low-roll", title: "Dice Low Roll", category: "dice",
  players: { min:1, max:1, multiplayer:false },
  description: "Bet that three dice will sum to 9 or less — a low-stakes dice betting game.",
  howToPlay: `Dice Low Roll is a betting game where you wager that three dice will sum to 9 or less. Each round, choose your bet amount — 5, 10, or 20 coins — then the dice roll automatically.

If the total is 9 or lower, you win your bet. If 10 or higher, you lose it. Start with 100 coins and try to grow your stack across 10 or 20 rounds.

The probability of rolling 9 or less with 3 dice is roughly 45%, so this bet loses slightly more often than it wins — but wins can chain together fast. Manage your bankroll well!`,
  settings,
  initialState: (seed:number, s:S) => initialState(seed, s as DiceLowRollSettings),
  reducer, isTerminal, 
  hint: (state: any) => { if ((state as any).phase === "gameover" || (state as any).gameOver) return null; return { selector: '[data-testid="hint-target-dice-low-roll-roll"]', pulses: 3 }; },
  component: DiceLowRollGame,
};
