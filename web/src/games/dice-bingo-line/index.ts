import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceBingoLineState, DiceBingoLineAction, DiceBingoLineSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceBingoLineGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceBingoLinePlugin: GamePlugin<DiceBingoLineState, DiceBingoLineAction, typeof settings> = {
  id:"dice-bingo-line", title:"Dice Bingo Line", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Roll 1d6 to fill a 5-cell bingo line. 25 rolls.",
  howToPlay:"Dice Bingo Line is a quick dice game where you try to fill a single bingo line of five numbers (1-5). Each roll of a six-sided die marks off the matching cell — if you've already filled that cell or rolled a 6, the roll is wasted.\n\nEach new cell filled scores 10 points. Completing the entire 1-5 line ends the game with a 100-point BINGO bonus.\n\nYou have up to 25 rolls. The game ends automatically when you complete the line OR when you exhaust all rolls. Average runs fill 4 of 5 cells; lucky runs hit BINGO in 8-10 rolls. The expected number of rolls to fill all five cells (collecting 5 of 6 distinct values) is around 14, so 25 rolls usually gives breathing room.\n\nJust keep pressing Roll. The line lights up green as you fill it, and you'll see your latest die face above the row. Aim for the BINGO bonus!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceBingoLineSettings),
  reducer,isTerminal,
  hint: (state: any) => { if ((state as any).phase === "gameover" || (state as any).gameOver) return null; return { selector: '[data-testid="hint-target-dice-bingo-line-roll"]', pulses: 3 }; },
  component:DiceBingoLineGame,
};
