import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { RaceState, RaceAction, RaceSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { RaceGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const troubleMiniPlugin: GamePlugin<RaceState, RaceAction, typeof settings> = {
  id: "trouble-mini",
  title: "Trouble (Mini)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Pop-O-Matic Ludo variant — compact 28-point track with three pegs each.",
  howToPlay: "Trouble is the classic Pop-O-Matic family game where dice are rolled inside a transparent dome. Mechanically it is a Ludo variant. This Mini edition uses a compact 28-cell track and three pegs per side instead of four for a quicker session.\n\nYou play one color against a random CPU. Click Roll to throw two dice. Click any of your three pegs and select either die value or the combined sum to advance it. Each die is used once per turn.\n\nThe board appears as a horizontal track of 29 cells. The final cell is the home for your pegs. Race all three of your pegs into the home cell before the CPU does to win.\n\nWith only three pegs to manage, every pip matters. Push your lead peg quickly while keeping the others advancing in step. The CPU plays random legal moves, so disciplined play wins consistently. Score is the pip-count differential at game end plus a 100-point win bonus. Aim for +20 or better for a strong Trouble Mini result.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as RaceSettings),
  reducer,
  isTerminal,
  component: RaceGame,
};
