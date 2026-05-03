import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { ClassicState, ClassicAction, ClassicSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { GameOfLifeClassicGame } from "./Game.js";

const settings = {
  startingCash: {
    kind: "number" as const,
    label: "Starting cash",
    min: 0,
    max: 500,
    step: 25,
    default: 100,
  },
} as const;
type S = SettingsOf<typeof settings>;

export const gameOfLifeClassicPlugin: GamePlugin<ClassicState, ClassicAction, typeof settings> = {
  id: "game-of-life-classic",
  title: "Game of Life (Classic)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Spin and travel a 30-square life path. Get a job, marry, raise kids, retire. Score your life.",
  howToPlay: `Game of Life (Classic) is a one-player tour through the milestones of an imaginary life. You begin at square 1 with $100 (configurable) and a family of 1.

On every turn press Spin to roll a number from 1 to 10 — the spinner advances your token along a 30-square snake-shaped path. Each square fires a fixed event:

— First Job sets your income (~$40/payday). Promotions raise it; the executive square pushes it past $100.
— Payday squares add your current income to your cash — they're worth more late game.
— Marriage and Baby squares grow your family by one (and cost cash).
— Vacation, Expense, and Taxes squares drain cash.
— Lottery squares add big windfalls (~$90-130).
— The final square is Retire — landing on or past it ends the game with a $200 bonus.

Your final Life Score is remaining cash + 25 per family + 50 per career stage reached + 200 retirement bonus. Aim above 500 for a comfortable life, above 800 for a wealthy one. Lucky spins on lottery squares and an early promotion compound nicely.

The life arc has three stages tracked in the HUD: Early Career (squares 0-7), Mid Career (8-19), Late Career (20-29), Retired (end). The stage bonus rewards reaching deeper into the path.`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ClassicSettings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "done" || p === "gameover" || p === "ended" || p === "finished" || (s as any).gameOver || (s as any).won || (s as any).complete || (s as any).isComplete) return null; return { selector: ".golclassic-btn", pulses: 3 }; },
  component: GameOfLifeClassicGame,
};
