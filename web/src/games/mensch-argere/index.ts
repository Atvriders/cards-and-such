import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { MenschState, MenschAction, MenschSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MenschGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const menschArgerePlugin: GamePlugin<MenschState, MenschAction, typeof settings> = {
  id: "mensch-argere",
  title: "Mensch Argere Dich Nicht",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "German cross-and-circle race game: roll a 6 to enter, run all four pawns home.",
  howToPlay: "Mensch Argere Dich Nicht is a race game inspired by the backgammon family. Classic German race. Roll a 6 to enter pawns; run them around the cross to the home column.\n\nIn this simplified, single-player edition, you play as the white side against a random CPU. Each turn the dice are rolled (two six-sided dice), and you can advance one of your checkers by either die value, or both dice combined. Click any checker that has a legal move and it will jump forward by the available pip count.\n\nThe board is shown as a horizontal track of 30 points. White checkers race from left to right; black checkers (CPU) race from right to left. Each side starts with 4 checkers grouped at the back. When all your checkers cross the finish line you have borne off and the game ends.\n\nScore is calculated from the pip-count differential: how far ahead of your opponent you finish. The CPU plays random legal moves, so a little pip-management gives you a clear edge. Aim to keep your checkers connected, advance the rear runners first, and bear off as quickly as possible. A high score is +30 or better.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as MenschSettings),
  reducer,
  isTerminal,
  component: MenschGame,
};
