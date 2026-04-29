import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { AbsState, AbsAction, AbsSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { AbsGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const ayoayoPlugin: GamePlugin<AbsState, AbsAction, typeof settings> = {
  id: "ayoayo",
  title: "Ayoayo",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Yoruba Mancala variant.",
  howToPlay: "Ayoayo is the Yoruba Mancala variant from Nigeria, a relative of Oware. In this 5x5 placement adaptation across 14 turns (7 each), you place seed-pieces on the grid; the CPU plays randomly. Click an empty cell. After 14 moves the higher count wins. Full Ayoayo plays on a 12-pit board (six per side) with four seeds per pit at start. Each turn a player picks up all seeds from one of their pits and sows them counter-clockwise, dropping one in each subsequent pit. Captures occur when the last seed lands in an opponent's pit bringing the count to two or three. Ayoayo is a foundational game in Yoruba culture; rules are taught from childhood. The game survived in diaspora communities throughout the Caribbean. Strategy in this placement version: contest the centre and edges. Final scoreboard: 100 points for the win, 25 for a tie. The full Mancala flow is rich; this version provides quick rounds.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as AbsSettings),
  reducer,
  isTerminal,
  component: AbsGame,
};
