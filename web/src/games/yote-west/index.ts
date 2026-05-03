import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { YoteWestState, YoteWestAction, YoteWestSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { YoteWestGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const yoteWestPlugin: GamePlugin<YoteWestState, YoteWestAction, typeof settings> = {
  id: "yote-west",
  title: "Yote (West African)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "West African 5x6 capture game — placement adaptation.",
  howToPlay: "Yote is a West African capture game played across Senegal, Mali, and Burkina Faso for centuries. The full game uses a 5x6 board with both players starting empty-handed and dropping pieces onto the board across several phases. This 5x5 placement adaptation captures the initial drop phase. Across 14 turns you and a random CPU alternate placing pieces on empty squares. Click an empty cell. The CPU plays uniformly random. After fourteen moves whoever has more pieces wins. Final scoreboard: 100 for a win, 25 for a tie. Yote's distinctive feature is its drop-and-jump capture: when capturing one piece you may immediately remove a second opponent piece anywhere on the board. The 'free remove' makes Yote far more dynamic than checkers and harder for engines to solve. Yote is taught to West African schoolchildren as a thinking game alongside Oware. Recent computational analysis suggests Yote favours the second player slightly. The placement reduction keeps territory; the full game has explosive captures.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as YoteWestSettings),
  reducer, isTerminal, hint: (state: YoteWestState): HintTarget | null => ((state.phase === "playing" && state.turn === "P") ? { selector: ".ab-cell:not(.p):not(.c)", pulses: 3 } : null), component: YoteWestGame,
};
