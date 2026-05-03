import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { ConnectState, ConnectAction, ConnectSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ConnectGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const gobbletClassicPlugin: GamePlugin<ConnectState, ConnectAction, typeof settings> = {
  id: "gobblet-classic",
  title: "Gobblet (Classic)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Four-in-a-row on a 4×4 grid; classic version simplified to placement.",
  howToPlay: "Gobblet is a connect-line game where larger pieces can gobble smaller ones to claim a square. The full game uses three sizes per side and dynamic piece movement. This Classic implementation focuses on the alignment goal: place pieces on a 4×4 grid and align four to win.\n\nYou play first against a random CPU. Click any empty cell to place a stone. The CPU plays a random legal move. The first player to align four stones of their color in a row, column, or diagonal wins.\n\nThe board displays as a 4×4 grid. Your stones show red; the CPU's stones show blue.\n\nGobblet's classic skill is anticipating your opponent's gobbling moves. In this placement-only simplification, focus instead on building double threats: two open-three lines force the CPU into a single block while you complete the other. The CPU plays random legal moves, so good threat-building wins reliably. A win scores 100 points plus a per-piece bonus; a draw is 25 points; a loss scores zero.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ConnectSettings),
  reducer,
  isTerminal,
  hint: (state) => state.phase === "playing" && state.turn === "P" ? { selector: ".cn-cell:not(.p):not(.c)", pulses: 3 } : null,
  component: ConnectGame,
};
