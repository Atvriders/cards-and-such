import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { RaceState, RaceAction, RaceSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { RaceGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const parchisMiniPlugin: GamePlugin<RaceState, RaceAction, typeof settings> = {
  id: "parchis-mini",
  title: "Parchís (Mini)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Compact Spanish Pachisi: shortened track, three pawns each.",
  howToPlay: "Parchís is the Spanish version of Pachisi, popular for centuries on the Iberian peninsula. This Mini edition shortens the standard 68-cell track to 36 cells and gives each player three pawns instead of four.\n\nYou play one color against a random CPU. Click Roll to throw two six-sided dice. Click any of your three pawns and advance it by either die value or by the combined sum. Each die is used at most once per turn.\n\nThe board is rendered as a horizontal 37-cell track. The final cell is the home base; move every pawn there to win.\n\nParchís strategy traditionally emphasizes safe squares and barriers, but in this simplified Mini edition you focus purely on pip-management. Spread your pawns evenly and push the leader. The CPU plays random legal moves, so consistent advancement wins. Final score equals 100 plus your pip-count differential at game end. An excellent Parchís Mini result is +20 or better in pip-lead.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as RaceSettings),
  reducer,
  isTerminal,
  component: RaceGame,
};
