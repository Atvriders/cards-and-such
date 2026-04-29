import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { RaceState, RaceAction, RaceSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { RaceGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const frustrationMiniPlugin: GamePlugin<RaceState, RaceAction, typeof settings> = {
  id: "frustration-mini",
  title: "Frustration (Mini)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "British pop-dome Ludo variant; compact track and three pegs.",
  howToPlay: "Frustration is the British equivalent of Trouble — a Ludo variant played with a pop-dome dice roller. This Mini edition compacts the standard track to 30 cells and gives each player three pegs.\n\nYou play one color against a random CPU. Click Roll to throw the two dice (representing two pops of the dome). Click any of your three pegs and pick a die value, or the combined sum, to advance it. Each die is used once per turn.\n\nThe board appears as a horizontal 31-cell track. Push every peg to the final home cell to win.\n\nWith just three pegs and a short track, Frustration Mini plays in a few minutes. Strategy is light: keep your pegs spread out so a single bad roll doesn't strand a back-runner. The CPU plays random legal moves, so methodical advance wins consistently. Final score equals 100 plus your pip-count lead. Most wins land in the +15 to +30 range; +25 or better is excellent.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as RaceSettings),
  reducer,
  isTerminal,
  component: RaceGame,
};
