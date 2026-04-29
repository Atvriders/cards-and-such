import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { RaceState, RaceAction, RaceSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { RaceGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const pachisiClassicPlugin: GamePlugin<RaceState, RaceAction, typeof settings> = {
  id: "pachisi-classic",
  title: "Pachisi (Classic)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "The original Indian cross-and-circle race game, played on a linearized 56-point track.",
  howToPlay: "Pachisi is the ancient Indian cross-and-circle race game and the ancestor of modern Ludo, Parcheesi, and many European derivatives. Players race their pawns around a cross-shaped track and into a central home base.\n\nThis single-player edition flattens the cross into a linear 56-cell track for clarity. You play one color (red) against a random CPU. Click Roll to throw two six-sided dice (modeling the cowrie shells). Click any of your four pawns and choose to advance it by either die or by the combined sum.\n\nThe board displays the track as 57 cells from start to home. Move all four pawns into the home cell to win.\n\nPachisi tactics center on two ideas: keep your pawns spread out to avoid leaving any piece too far back, and push your leading pawn quickly so the CPU cannot easily catch and block it. The CPU plays random legal moves, so steady advancement wins consistently. Final score equals 100 plus the pip-count differential at game end. A clean win earns +30 or more on top of the base points.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as RaceSettings),
  reducer,
  isTerminal,
  component: RaceGame,
};
