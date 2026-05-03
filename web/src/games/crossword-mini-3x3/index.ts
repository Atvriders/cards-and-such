import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { CrosswordMini3x3State, CrosswordMini3x3Action, CrosswordMini3x3Settings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CrosswordMini3x3Game } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const crosswordMini3x3Plugin: GamePlugin<CrosswordMini3x3State, CrosswordMini3x3Action, typeof settings> = {
  id:"crossword-mini-3x3", title:"Crossword Mini 3x3", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"A bite-sized 3x3 crossword: three Across clues, three Down clues, nine letters.",
  howToPlay:`Crossword Mini 3x3 packs an entire crossword into nine squares. You'll get three Across clues (one per row) and three Down clues (one per column), each leading to a three-letter word. Letters at the intersections must satisfy both clues, just like a full crossword.

Click any cell on the grid to focus it, then tap a letter from the on-screen keyboard to fill it in. The cursor advances to the next cell automatically. To revise a letter, click the cell and type a new one — it will overwrite the existing value.

When you think you have it, press Check. If every cell matches the hidden solution, the puzzle is solved.

Each game randomly picks one of four mini puzzles, so seed variety keeps things fresh. Score: 500 minus 5 per move (50 floor). The minimum theoretical move count is 9 — one letter per cell — so a perfect first-try solve scores 455.

Sharpen your three-letter vocab and you'll be a mini-crossword speed demon!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CrosswordMini3x3Settings),
  reducer, isTerminal, hint: (state: CrosswordMini3x3State): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-crossword-mini-3x3-answer-0"]', pulses: 3 } : null, component: CrosswordMini3x3Game,
};
