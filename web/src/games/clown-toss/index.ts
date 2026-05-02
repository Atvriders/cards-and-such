import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ClownTossState, ClownTossAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ClownToss } from "./ClownToss.js";

export const clownTossSettings = {
  pegs: {
    kind: "enum" as const,
    label: "Pegs",
    options: ["3", "5", "7"] as const,
    default: "5" as const,
  },
} as const;

type ClownTossSettingsType = SettingsOf<typeof clownTossSettings>;

export const clownTossPlugin: GamePlugin<ClownTossState, ClownTossAction, typeof clownTossSettings> = {
  id: "clown-toss",
  title: "Clown Toss",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Toss rings onto carnival pegs and build streaks for bonus points.",
  howToPlay: `Clown Toss is a carnival ring-toss arcade game. You have a supply of rings to throw and a row of colourful pegs to aim at. Each peg has a point value — higher-point pegs are harder to consistently hit. Your goal is to land as many rings on pegs as possible and build scoring streaks.

Click any peg to toss a ring at it. Each toss has a random success rate — about 70% of tosses hit. When a ring lands on a peg, you score that peg's points. Missing wastes a ring and resets your consecutive hit streak.

Streak bonus: landing two or more consecutive hits in a row adds a 50% bonus to each additional hit. Three hits in a row on a 100-point peg earns 150 points per hit instead of 100. Keep the streak alive for maximum scoring.

The game ends when all rings have been tossed. Final score equals your total raw score divided by 5, capped at 1000. With 5 pegs you get 15 rings; with 7 pegs you get 21 rings, giving more chances but the same target.

Scoring: aim for the highest-point peg (🃏, 200pts) to maximise individual ring value. Any 3-ring streak on the 200-point peg earns 300pts per ring — the fastest route to a top score. However, lower-point pegs may feel safer if you are losing your streak.

Tips: once you have a streak of 2+, keep targeting the same peg to maintain it. Switching pegs after a miss is a common mistake — the peg does not affect hit probability.`,
  settings: clownTossSettings,
  initialState: (seed: number, settings: ClownTossSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
    hint: (state: ClownTossState) => {
      if (isTerminal(state)) return null;
      return { selector: '[data-testid="hint-target-clown-toss-action"]', pulses: 3 };
    },
  component: ClownToss,
};
