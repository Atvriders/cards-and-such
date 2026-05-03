import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { OmwesoUgandaState, OmwesoUgandaAction, OmwesoUgandaSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { OmwesoUgandaGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const omwesoUgandaPlugin: GamePlugin<OmwesoUgandaState, OmwesoUgandaAction, typeof settings> = {
  id: "omweso-uganda",
  title: "Omweso (Uganda)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Ugandan four-row Mancala — placement abstraction.",
  howToPlay: "Omweso is the Ugandan four-row Mancala game played by the Buganda kingdom for centuries. The full game uses 32 holes (4 rows of 8) with seeds sown around in complex 'reaping' captures. This 4x4 placement adaptation focuses on the territorial claim. Across 14 turns you and a random CPU alternate placing pieces on empty cells of the 16-cell board. Click an empty cell. The CPU plays uniformly random. After fourteen moves the player with more pieces wins. Final scoreboard: 100 for a win, 25 for a tie. Omweso remains a respected sport in Uganda; the Federation Internationale de Mancala recognizes it as one of the deepest Mancala variants. Master Omweso players run move sequences that capture in waves across the board. The 4x4 reduction can't capture the seed-sowing dance, but it preserves the 'where to claim' intuition. Omweso boards in Buganda are often hand-carved from a single block of wood with chickens scratching beside them.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as OmwesoUgandaSettings),
  reducer, isTerminal, hint: (state: OmwesoUgandaState): HintTarget | null => ((state.phase === "playing" && state.turn === "P") ? { selector: ".ab-cell:not(.p):not(.c)", pulses: 3 } : null), component: OmwesoUgandaGame,
};
