import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { AbsState, AbsAction, AbsSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { AbsGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const mangalaArabianPlugin: GamePlugin<AbsState, AbsAction, typeof settings> = {
  id: "mangala-arabian",
  title: "Mangala (Arabian)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Arabian Mancala ancestor.",
  howToPlay: "Mangala is the Arabian root of the global Mancala family, played from medieval times onward. In this 5x5 placement adaptation across 14 turns (7 each), you place stone-pieces on the grid; the CPU plays randomly. Click an empty cell. After 14 moves the higher count wins. Full Mangala plays on a 12 or 14-pit board with 4-6 stones per pit at start. Sowing direction varies by region (Egyptian counter-clockwise, Syrian clockwise). Captures occur when the last stone lands in an opponent's pit making the count 2 or 4. Mangala is the linguistic root of 'Mancala' itself; the game spread along Arab trade routes from the 6th century to West Africa, East Africa, India, and Southeast Asia. Surviving Mangala boards are carved into stone benches and tomb-walls across the Middle East. Strategy in this placement version: contest the centre. Final scoreboard: 100 points for the win, 25 for a tie. The deep history is preserved by every wooden Mangala board sold in Cairo bazaars today.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as AbsSettings),
  reducer, isTerminal, hint: (state: AbsState): HintTarget | null => ((state.phase === "playing" && state.turn === "P") ? { selector: ".ab-cell:not(.p):not(.c)", pulses: 3 } : null), component: AbsGame,
};
