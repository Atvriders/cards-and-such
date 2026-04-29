import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { AbsState, AbsAction, AbsSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { AbsGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const zertzMarblesPlugin: GamePlugin<AbsState, AbsAction, typeof settings> = {
  id: "zertz-marbles",
  title: "ZERTZ (Marbles)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Jumping marble capture abstract.",
  howToPlay: "ZERTZ is Kris Burm's marble-capturing abstract where players jump marbles to claim them. In this 5x5 placement adaptation across 14 turns (7 each), you place marbles on intersections; the CPU plays randomly. Click an empty cell. After 14 moves the player with more placed marbles wins. ZERTZ's full version uses contracting boards and forced jumps, but this simplified placement preserves the marble-counting core. The original ZERTZ won the Mensa Select award in 2000 and is the second game in Burm's Project Gipf series. The mechanic of contracting territory is one of the most innovative in modern abstracts; this adaptation shows the basic counting that drives advanced strategy. Strategy: spread placements to deny CPU clusters. Final scoreboard: 100 points for the win, 25 for a tie. Real ZERTZ goes much deeper with multi-jumps, sacrifice-marbles, and end-game endgames; this version is your gateway.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as AbsSettings),
  reducer,
  isTerminal,
  component: AbsGame,
};
