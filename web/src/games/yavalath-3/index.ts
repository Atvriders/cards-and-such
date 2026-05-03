import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { Yavalath3State, Yavalath3Action, Yavalath3Settings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Yavalath3Game } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const yavalath3Plugin: GamePlugin<Yavalath3State, Yavalath3Action, typeof settings> = {
  id: "yavalath-3",
  title: "Yavalath",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Hex 'four wins, three loses' connection game.",
  howToPlay: "Yavalath is a 2007 abstract by Cameron Browne, computer-evolved by an AI program named LUDI that designed games as part of a research project. The full game uses a hexagonal board where you win by making four-in-a-row but lose by accidentally making three-in-a-row first — a brilliant inversion that creates uniquely tense tactics. This 5x5 placement adaptation focuses on territorial claim. Across 14 turns you and a random CPU alternate placing pieces on empty squares. Click an empty cell. The CPU plays uniformly random. After fourteen moves the player with more pieces wins. Final scoreboard: 100 for a win, 25 for a tie. Yavalath made history as the first commercially-published game designed by an AI. Cameron Browne's LUDI was a research program at Imperial College London; Yavalath was its hand-picked output among thousands of candidate rulesets. The full game forces players to build threes only as part of fours — a positional puzzle that has fascinated abstract enthusiasts since 2007. The placement reduction can't replicate the three-loss tension but keeps the territorial feel.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as Yavalath3Settings),
  reducer, isTerminal, hint: (state: Yavalath3State): HintTarget | null => ((state.phase === "playing" && state.turn === "P") ? { selector: ".ab-cell:not(.p):not(.c)", pulses: 3 } : null), component: Yavalath3Game,
};
