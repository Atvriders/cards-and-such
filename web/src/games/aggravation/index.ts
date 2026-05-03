import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { AggravationState, AggravationAction, AggravationSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { AggravationGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const aggravationPlugin: GamePlugin<AggravationState, AggravationAction, typeof settings> = {
  id: "aggravation",
  title: "Aggravation",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Marble race game derived from Pachisi with shortcut squares.",
  howToPlay: "Aggravation is a race game inspired by the backgammon family. Marbles race around the board with shortcut hub squares. Land on opponent to send home.\n\nIn this simplified, single-player edition, you play as the white side against a random CPU. Each turn the dice are rolled (two six-sided dice), and you can advance one of your checkers by either die value, or both dice combined. Click any checker that has a legal move and it will jump forward by the available pip count.\n\nThe board is shown as a horizontal track of 30 points. White checkers race from left to right; black checkers (CPU) race from right to left. Each side starts with 4 checkers grouped at the back. When all your checkers cross the finish line you have borne off and the game ends.\n\nScore is calculated from the pip-count differential: how far ahead of your opponent you finish. The CPU plays random legal moves, so a little pip-management gives you a clear edge. Aim to keep your checkers connected, advance the rear runners first, and bear off as quickly as possible. A high score is +30 or better.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as AggravationSettings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "done" || p === "gameover" || p === "ended" || p === "finished" || (s as any).gameOver || (s as any).won || (s as any).complete || (s as any).isComplete) return null; return { selector: ".aggravation-btn", pulses: 3 }; },
  component: AggravationGame,
};
