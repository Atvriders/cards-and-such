import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { PubState, PubAction, PubSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PubGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const cribbageShotgunPlugin: GamePlugin<PubState, PubAction, typeof settings> = {
  id: "cribbage-shotgun",
  title: "Cribbage: Shotgun",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Compressed cribbage starting at 91; quick bar format.",
  howToPlay: "Cribbage: Shotgun starts both players at 91 pegs — the last 30 of a regular game compressed into a 5-round dash. Each round press Peg to advance random points (1-12) toward the 121 finish. The first player to reach or pass 121 wins. The CPU pegs simultaneously. Shotgun is the bar-pub speed-run variant where a casual hand finishes in three minutes; perfect for filler between drinks. Because the start is high there's almost no recovery from a slow round, and a single rolling-12 from the CPU can finish the round outright. The variant favours consistent pegging and dramatic finishes. Watch the peg counter; you'll know within a round or two if you're racing or chasing. Final scoreboard awards a clean 100 points for a win, 25 for tying out, 0 for losing. The shotgun-cribbage format is a popular weeknight bar-pub option when full cribbage takes too long. Pour another and roll again.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as PubSettings),
  reducer,
  isTerminal,
  component: PubGame,
};
