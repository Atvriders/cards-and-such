import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceReplayBaseballDetailState, DiceReplayBaseballDetailStateAction, DiceReplayBaseballDetailSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceReplayBaseballDetailGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceReplayBaseballDetailPlugin: GamePlugin<DiceReplayBaseballDetailState, DiceReplayBaseballDetailStateAction, typeof settings> = {
  id: "dice-replay-baseball-detail", title: "Dice Replay Baseball", category: "dice",
  players: { min:1, max:1, multiplayer:false },
  description: "Stat-capturing baseball sim; inning by inning.",
  howToPlay: "Dice Replay Baseball models the Replay Baseball game, a stat-capturing baseball simulation focused on full-season replay accuracy. Where Strat focuses on real-time playable matchups, Replay emphasizes preserving the seasonal stat lines of every player. A 162-game season simulated in Replay produces stat sheets that closely match historical totals.\n\nThis dice-only sim captures the at-bat rhythm. Each round (an at-bat), you Roll three dice. Outcomes: triple (home run +3 your team), sum >= 15 (extra-base hit +1 your team and +1 next round bonus), sum <= 6 (double play, opp +1), otherwise out or walk (no change).\n\nGame ends at 12 your points or 15 rounds. Final score formula: 80 + (5 × your points) - (3 × opponent points) + (2 × rounds remaining if you finish early). Replay's pacing rewards patience — it's a simulation game, not an action game. Average runs 105 to 140. Press Roll, Next.",
  settings,
  initialState: (seed:number, s:S) => initialState(seed, s as DiceReplayBaseballDetailSettings),
  reducer, isTerminal, component: DiceReplayBaseballDetailGame,
};
