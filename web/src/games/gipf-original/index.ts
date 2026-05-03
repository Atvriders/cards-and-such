import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { GipfOriginalState, GipfOriginalAction, GipfOriginalSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { GipfOriginalGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const gipfOriginalPlugin: GamePlugin<GipfOriginalState, GipfOriginalAction, typeof settings> = {
  id: "gipf-original",
  title: "Gipf Original",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Project Gipf flagship — placement adaptation.",
  howToPlay: "Gipf is the flagship 1997 abstract by Kris Burm and the namesake of the entire Project Gipf series. The full game uses a 37-cell hexagonal board with players sliding pieces from edges and forming four-in-a-row to capture. This 5x5 placement adaptation captures only the territorial setup phase. Across 14 turns you and a random CPU alternate placing pieces on empty squares. Click an empty cell. The CPU plays uniformly random. After fourteen moves the player with more pieces wins. Final scoreboard: 100 for a win, 25 for a tie. Gipf launched a six-game series (Gipf, Tamsk, Zertz, Dvonn, Yinsh, Punct, Tzaar) often hailed as the highest-quality abstract collection ever published. The original Gipf has a 'potentials' system where captured pieces become reserves you can drop. The placement reduction skips that depth but preserves the territory-claim intuition. Burm designed Gipf in his Antwerp studio over four years.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as GipfOriginalSettings),
  reducer, isTerminal, hint: (state: GipfOriginalState): HintTarget | null => ((state.phase === "playing" && state.turn === "P") ? { selector: ".ab-cell:not(.p):not(.c)", pulses: 3 } : null), component: GipfOriginalGame,
};
