import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BSState, BSAction, BSSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BattleshipSolitaire } from "./BattleshipSolitaire.js";

export const bsSettings = {
  difficulty: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "medium"] as const,
    default: "easy",
  },
} as const;

type BSSettingsType = SettingsOf<typeof bsSettings>;

export const battleshipSolitairePlugin: GamePlugin<BSState, BSAction, typeof bsSettings> = {
  id: "battleship-solitaire",
  title: "Battleship Solitaire",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Deduce the positions of hidden ships using row and column clue counts.",
  howToPlay: `Battleship Solitaire (also called Bimaru) is a logic puzzle based on the classic Battleship game. A fleet of ships is hidden inside a grid. Your goal is to locate every ship segment by logic alone, without guessing.

Numbers along the top and left edges tell you exactly how many ship segments appear in each column and row, respectively. Some cells are pre-revealed to give you a head start — they already show either a ship segment or open water.

Click any unmarked cell to cycle through three states: ship segment (■), water (~), or back to unmarked. Fill in the entire grid so every row and column count matches its clue.

Key rules: ships are horizontal or vertical sequences of contiguous segments. No two ships may touch, even diagonally — there is always at least one water cell separating any two ships. Use this "no-diagonal-touching" rule heavily: if you place a ship segment, all eight neighbors that are not part of the same ship must be water.

Strategy: start with rows or columns whose clue equals their length (all ships) or zero (all water). Then use the no-touching rule to eliminate cells around known ship segments. Cross-reference row and column constraints to narrow down remaining possibilities.`,
  settings: bsSettings,
  initialState: (seed: number, settings: BSSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver || (s as any).won || (s as any).isWon || (s as any).isComplete || (s as any).complete) return null; return { selector: '[data-testid="hint-target-battleship-solitaire-action"]', pulses: 3 }; },
  component: BattleshipSolitaire,
};
