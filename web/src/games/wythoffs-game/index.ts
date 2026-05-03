import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GameState, GameAction, GameSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { WythoffsGameGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const wythoffsGamePlugin: GamePlugin<GameState, GameAction, typeof settings> = {
  id: "wythoffs-game",
  title: "Wythoff's Game",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Nim variant — remove pieces from rows or both equally. Place/remove vs random CPU.",
  howToPlay: "Wythoff's Game is a classic combinatorial game described by Willem Wythoff in 1907. Two heaps of pieces are present; on each turn, a player must remove any positive number from either single heap, OR remove the same number from both heaps simultaneously. The player who takes the last piece(s) wins. In this compact 5x5 grid placement adaptation, Wythoff's heap mechanic is reimagined as positional removal.\n\nThe board starts filled with P pieces in row 0 (your heap A) and row 1 (your heap B). Click any P piece in those rows to remove it. If you remove from row 0 alone or row 1 alone, you score 1 point. Strategic removal beats random hacking. After your turn, a random CPU removes a random P piece from the board.\n\nGameplay lasts up to 14 moves or until rows 0-1 are empty. You earn 100 points if you cleared all P pieces from rows 0-1 first, plus your accumulated removal score times 2. Plan removal sequences that leave the CPU unable to mimic your strategy.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as GameSettings),
  reducer,
  isTerminal,
  hint: (): HintTarget | null => (typeof document !== "undefined" && document.querySelector(".wyt-board")) ? { selector: ".wyt-board", pulses: 3 } : null,
  component: WythoffsGameGame,
};
