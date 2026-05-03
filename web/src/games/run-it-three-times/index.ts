import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { RunItThreeTimesState, RunItThreeTimesAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { RunItThreeTimesGame } from "./Game.js";

const settings = {
  rounds: { kind: "enum" as const, label: "Rounds", options: ["10"] as const, default: "10" as const },
} as const;

export const runItThreeTimesPlugin: GamePlugin<RunItThreeTimesState, RunItThreeTimesAction, typeof settings> = {
  id: "run-it-three-times",
  title: "Run It Three Times",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "All-in equity is run on three separate boards; results split three ways.",
  howToPlay: `Run It Three Times is a single-player card-combo game. All-in equity is run on three separate boards; results split three ways. Each round you receive a five-card hand from a shuffled 52-card deck and score points based on the strongest poker-style combo present.

Special rule: After each deal, two phantom boards are dealt and partial scores from those add a small bonus to your main score.

Press Deal to receive a new five-card hand. The score for that hand is computed instantly using the variant's scoring table — pairs, two-pair, three-of-a-kind, straight, flush, full house, four-of-a-kind, straight flush. Bonus or wild rules adjust the totals up.

Play continues for ten rounds, accumulating points. The deck reshuffles each round so high cards are always available. Aim for the highest possible cumulative score by riding lucky deals.

The seed determines the entire shuffle sequence, so you can replay an identical run by entering the same seed. After ten rounds, your final score is locked in. Single-player only — no CPU opponent. A bite-sized poker variant perfect for short play sessions.`,
  settings,
  initialState: (seed, _s) => initialState(seed, { rounds: "10" }),
  reducer, isTerminal,
  hint: (state: any) => {
    if (state.phase === "ready") return { selector: '[data-testid="hint-target-run-it-three-times-deal"]', pulses: 3 };
    if (state.phase === "dealt") return { selector: '[data-testid="hint-target-run-it-three-times-next"]', pulses: 3 };
    return null;
  }, component: RunItThreeTimesGame,
};
