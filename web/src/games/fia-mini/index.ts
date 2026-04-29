import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { RaceState, RaceAction, RaceSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { RaceGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const fiaMiniPlugin: GamePlugin<RaceState, RaceAction, typeof settings> = {
  id: "fia-mini",
  title: "Fia (Scandinavian Mini)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Scandinavian Ludo variant — exact roll required to enter home.",
  howToPlay: "Fia is the Scandinavian Ludo variant where an exact roll is required to enter the home cell — an overshoot wastes the move. This Mini edition uses a compact 28-cell track and three pawns per side.\n\nYou play one color against a random CPU. Click Roll to throw two dice. Click any of your three pawns and advance it by either die value or by the combined sum. Each die may be used once per turn.\n\nThe board is shown as a horizontal 29-cell track. Cell 28 is the home; deliver all three of your pawns there to win.\n\nFia's exact-entry rule means rear pawns sometimes need careful pacing — too many pip totals can overshoot home and waste the turn. The CPU plays random legal moves, so a balanced advance reliably outpaces it. Final score equals 100 plus your pip-count differential at game end. A strong Fia Mini win lands at +20 or better in pip-bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as RaceSettings),
  reducer,
  isTerminal,
  component: RaceGame,
};
