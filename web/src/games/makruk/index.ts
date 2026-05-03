import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { MakrukState, MakrukAction, MakrukSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Makruk } from "./Game.js";

const settings = {} as const;

export const makrukPlugin: GamePlugin<MakrukState, MakrukAction, typeof settings> = {
  id: "makruk",
  title: "Makruk",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Thai Chess — ancient Southeast Asian chess with unique queen and bishop movement.",
  howToPlay: `Makruk is the traditional chess of Thailand, played on an 8×8 board. You play White (bottom); the bot plays Black (top). The goal is to checkmate the enemy King.

Pieces and movement: King (♚) moves one step in any direction. Met (♛, Thai queen) moves one step diagonally or one step straight forward — much weaker than a Western queen. Khon (♝, Thai bishop) moves one step diagonally or one step straight forward, identical to the Met. Ma (♞, knight) moves in the standard L-shape. Ruea (♜, rook) slides any number of squares orthogonally. Bia (♟, pawn) moves one step forward and captures diagonally.

Promotion: Pawns promote when they reach the sixth rank from their starting side — that is, White pawns promote upon reaching row 3 (counting from the top). A promoted pawn (Bia) becomes a Met.

The game ends when a player's King cannot escape check (checkmate). Click a piece to select it; highlighted squares show legal destinations. The bot plays at depth 2.`,
  settings,
  initialState: (seed: number, s: MakrukSettings) => initialState(seed, s),
  reducer,
  isTerminal,
  hint: (): HintTarget | null => (typeof document !== "undefined" && document.querySelector(".makruk-board")) ? { selector: ".makruk-board", pulses: 3 } : null,
  component: Makruk,
};
