import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GolfSixShedState, GolfSixShedAction, GolfSixShedSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { GolfSixShedGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const golfSixShedPlugin: GamePlugin<GolfSixShedState, GolfSixShedAction, typeof settings> = {
  id: "golf-six-shed", title: "Six-Card Golf", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Lay out 6 cards face-down; flip and score lowest total.",
  howToPlay: "Six-Card Golf is a shedding-style scoring game where the goal is the lowest total, not the highest. You are dealt six face-down cards arranged in a 2 x 3 grid. The engine flips them one at a time and tallies the score.\n\nCard values: aces count one, twos count negative two, threes through tens count face value, jacks and queens count ten, and kings count zero. Pairs of identical ranks in the same column cancel each other out (count zero). Lowest total wins.\n\nSix rounds are played. Each round you compete against a CPU dealt the same way. Whoever has the lower total earns thirty points; if it's a tie, both score ten. A perfect zero would be a lucky alignment of negative twos and kings.\n\nThere is nothing for the player to choose in this auto-flip version — it's a no-decision dealer's game. Expected per-round score is fifteen to twenty points; over six rounds, around 100 points is a respectable run, while pushing past 150 means the cards loved you tonight.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as GolfSixShedSettings),
  reducer, isTerminal, component: GolfSixShedGame,
};
