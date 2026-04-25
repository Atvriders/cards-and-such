import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Dice Bingo Mini: A 3x3 bingo card filled with numbers 1-9. Roll a die each turn.
// If the rolled number is on your card, mark it. Complete a row, column, or diagonal to win.

export interface DiceBingoMiniSettings { rolls: "15" | "20"; }

export interface DiceBingoMiniState {
  card: number[][];       // 3x3 grid of numbers 1-9
  marked: boolean[][];    // which cells are marked
  die: number;
  rollCount: number;
  maxRolls: number;
  score: number;
  phase: "rolling" | "won" | "gameover";
  rngSeed: number;
  bingos: number;
}

export type DiceBingoMiniAction = { type: "roll" };

function checkBingo(marked: boolean[][]): number {
  let count = 0;
  // rows
  for (let r = 0; r < 3; r++) if (marked[r]!.every(Boolean)) count++;
  // cols
  for (let c = 0; c < 3; c++) if ([0,1,2].every(r => marked[r]![c])) count++;
  // diagonals
  if ([0,1,2].every(i => marked[i]![i])) count++;
  if ([0,1,2].every(i => marked[i]![2-i])) count++;
  return count;
}

export function initialState(seed: number, settings: DiceBingoMiniSettings): DiceBingoMiniState {
  const rng = mulberry32(seed);
  // 3x3 card with numbers 1-9 (each appears exactly once)
  const nums = [1,2,3,4,5,6,7,8,9];
  for (let i = 8; i > 0; i--) { const j = Math.floor(rng() * (i+1)); [nums[i], nums[j]] = [nums[j]!, nums[i]!]; }
  const card = [[nums[0]!, nums[1]!, nums[2]!], [nums[3]!, nums[4]!, nums[5]!], [nums[6]!, nums[7]!, nums[8]!]];
  const marked = [[false,false,false],[false,false,false],[false,false,false]];
  const die = Math.floor(rng() * 6) + 1;
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return { card, marked, die, rollCount: 0, maxRolls: parseInt(settings.rolls, 10), score: 0, phase: "rolling", rngSeed: nextSeed, bingos: 0 };
}

export function reducer(state: DiceBingoMiniState, action: DiceBingoMiniAction): DiceBingoMiniState {
  if (state.phase === "won" || state.phase === "gameover") return state;
  if (action.type === "roll") {
    const rng = mulberry32(state.rngSeed);
    const die = Math.floor(rng() * 6) + 1;
    const nextSeed = Math.floor(rng() * 2 ** 31);
    // Mark all cells matching die value
    const marked = state.marked.map((row, r) =>
      row.map((m, c) => m || state.card[r]![c] === die)
    );
    const bingos = checkBingo(marked);
    const prevBingos = checkBingo(state.marked);
    const newBingoPts = (bingos - prevBingos) * 50;
    const newRollCount = state.rollCount + 1;
    const allMarked = marked.every(row => row.every(Boolean));
    const phase = allMarked || bingos >= 4 ? "won" : newRollCount >= state.maxRolls ? "gameover" : "rolling";
    return { ...state, die, marked, rollCount: newRollCount, score: state.score + 5 + newBingoPts, phase, rngSeed: nextSeed, bingos };
  }
  return state;
}

export function isTerminal(state: DiceBingoMiniState): { score: number } | null {
  return (state.phase === "won" || state.phase === "gameover") ? { score: state.score } : null;
}
