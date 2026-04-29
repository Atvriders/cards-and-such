import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { AbsState, AbsAction, AbsSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { AbsGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const oukChatrangPlugin: GamePlugin<AbsState, AbsAction, typeof settings> = {
  id: "ouk-chatrang",
  title: "Ouk Chatrang",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Cambodian chess; ancestor of Makruk.",
  howToPlay: "Ouk Chatrang is the traditional Cambodian chess, ancestor of Thai Makruk. In this 5x5 placement adaptation across 14 turns (7 each), you place pieces on the grid; the CPU plays randomly. Click an empty cell. After 14 moves the higher count wins. Full Ouk Chatrang plays on an 8x8 board with pieces similar to Makruk: King (Sdach), Queen-equivalent (Ney), Bishop-equivalent (Koul), Knight (Ses), Rook (Tuuk), and Pawns. The opening pawn ranks are on the third rank rather than the second, and the queen-piece is weak — moves only one diagonal. Ouk Chatrang remains popular in rural Cambodia where chess sets are hand-carved from local wood. The game survived the Khmer Rouge era and is undergoing revival in Phnom Penh chess clubs. Strategy in this placement variant: contest the centre. Final scoreboard: 100 points for the win, 25 for a tie.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as AbsSettings),
  reducer,
  isTerminal,
  component: AbsGame,
};
