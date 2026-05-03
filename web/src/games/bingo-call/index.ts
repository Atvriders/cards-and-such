import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { BingoCallState, BingoCallAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BingoCall } from "./BingoCall.js";

export const bingoCallPlugin = {
  id: "bingo-call",
  title: "Bingo Call",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Hit BINGO on your 5×5 card as numbers are called — quicker wins score higher!",
  howToPlay: `Bingo Call is a solo bingo game with a classic 5×5 card. The centre square is always FREE and starts daubed. Numbers from 1 to 75 are called in a random order — B (1-15), I (16-30), N (31-45), G (46-60), O (61-75).

Each press of Next Number reveals the latest call. If that number appears on your card it is automatically daubed in red. Watch your card for a line forming — any complete row, column, or diagonal wins the game.

Your score rewards early bingo: a win on the very first possible call scores up to 1000 points, dropping by 20 for each additional number needed. A bingo after 20 calls scores 620; after 40 calls scores 220. If all 75 numbers are called without a bingo you score zero.

The card is randomly generated each seed so every game is unique. Strategy is minimal — just watch the daubs accumulate and feel the tension rise as lines grow close to completion. A nail-biting finish is just one number away!`,
  settings: {} as Record<string, never>,
  initialState: (seed: number) => initialState(seed),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-bingo-call-action"]', pulses: 3 }; },
  component: BingoCall,
} as unknown as GamePlugin;
