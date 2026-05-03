import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SpoonsGrabState, SpoonsGrabAction, SpoonsGrabSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SpoonsGrabGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const spoonsGrabPlugin: GamePlugin<SpoonsGrabState, SpoonsGrabAction, typeof settings> = {
  id: "spoons-grab", title: "Spoons Grab", category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Spot the hand with four of a kind.",
  howToPlay: "Spoons Grab adapts the four-of-a-kind speed game's identification challenge. Each of fifteen rounds shows four candidate hands; one has four-of-a-kind (e.g., '[A,A,A,A]') and three are near-misses (e.g., '[K,K,K,Q]'). Pick the four-of-a-kind, hit Submit, score ten points. Max 150 points across all fifteen rounds. The original Spoons has players passing cards trying to collect four-of-a-kind, then grabbing for a center spoon when one player wins — last to grab loses a letter (S-P-O-O-N). This digital version tests the four-of-a-kind spotting skill alone — the trigger that fires the spoon-grab in live play. Sharp pattern-spotters score 130+; first-timers 90-110. Distractor hands always have three-of-a-kind plus an off-suit, making them visually similar to legitimate fours. Hit Submit and Next to advance. Total run takes about a minute and a half.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SpoonsGrabSettings),
  reducer, isTerminal, hint: (state: SpoonsGrabState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-spoons-grab-answer-0"]', pulses: 3 } : null, component: SpoonsGrabGame,
};
