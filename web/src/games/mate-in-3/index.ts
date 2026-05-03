import type { GamePlugin } from "../../platform/game-plugin/types.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Game } from "./Game.js";

export const mateIn3Plugin = {
  id: "mate-in-3",
  title: "Mate in Three",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "10 chess puzzles requiring a precise three-move sequence to force checkmate.",
  howToPlay: `Mate in Three pushes your calculation skills further. Each of the 10 puzzles demands a three-move combination: White plays move 1 (the key move), the computer responds as Black, White plays move 2, Black replies again, and then White delivers the finishing blow on move 3.

The first move must be the correct key move — if you choose wrong you'll see an error and can retry. Moves 2 and 3 are more open; you just need to ultimately deliver checkmate on move 3.

Strategy tips: look for forcing moves on move 1 — checks, captures, or threats that severely restrict Black's options. After the key move, visualize where the Black king will be and plan the mating net. Common patterns here include driving the king to a corner with two rooks, queen-and-rook collaboration, and zugzwang positions where any Black move makes things worse.

Click pieces to select them, click green squares to move. Use the Try Again button to reset any puzzle. Good luck mastering three-move combinations!`,
  settings: {} as const,
  initialState: () => initialState(),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "done" || p === "gameover" || p === "ended" || p === "finished" || (s as any).gameOver || (s as any).won || (s as any).complete || (s as any).isComplete) return null; return { selector: ".cp-btn", pulses: 3 }; },
  component: Game,
} as unknown as GamePlugin;
