import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { Dice100TargetState, Dice100TargetAction, Dice100TargetSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Dice100Target } from "./Game.js";

const dice100TargetSettings = {
  rounds: { kind: "enum" as const, label: "Rounds", options: ["3", "5", "7"] as const, default: "5" as const },
} as const;

type S = SettingsOf<typeof dice100TargetSettings>;

export const dice100TargetPlugin: GamePlugin<Dice100TargetState, Dice100TargetAction, typeof dice100TargetSettings> = {
  id: "dice-100-target",
  title: "Dice 100 Target",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Roll one die at a time and accumulate a total. Stop before you bust past 100 — the closer to 100 you stop, the more points you earn!",
  howToPlay: `Dice 100 Target is a push-your-luck game with a running total. Each round you start at zero and roll a single six-sided die as many times as you like. Your running total climbs with each roll.

The closer your total is to 100 without going over, the more points you earn for that round. Stop at exactly 100 and you bank 100 points. Stop at 95 and you bank 95. But if any roll pushes your total past 100, you BUST and score zero for that round.

The tension builds as your total climbs. Each extra roll risks a bust — is that potential 5 extra points worth the risk of losing everything?

Press Roll Die to keep going, or Stop and Bank to secure your current total. The next round resets to zero. Your score accumulates across all rounds.

Use Settings to choose 3, 5, or 7 rounds. Maximum possible score is 500/700. Can you get close to 100 every single round?`,
  settings: dice100TargetSettings,
  initialState: (seed: number, s: S) => initialState(seed, s as Dice100TargetSettings),
  reducer, isTerminal, component: Dice100Target,
};
