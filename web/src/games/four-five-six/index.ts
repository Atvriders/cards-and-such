import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { FourFiveSixState, FourFiveSixAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { FourFiveSix } from "./FourFiveSix.js";

export const fourFiveSixSettings = {
  rounds: {
    kind: "enum" as const,
    label: "Rounds",
    options: ["5", "10", "20"] as const,
    default: "10",
  },
} as const;

type FourFiveSixSettingsType = SettingsOf<typeof fourFiveSixSettings>;

export const fourFiveSixPlugin: GamePlugin<FourFiveSixState, FourFiveSixAction, typeof fourFiveSixSettings> = {
  id: "four-five-six",
  title: "Four-Five-Six",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Roll 3 dice vs the dealer — hit 4-5-6 to win instantly or set a point higher than the dealer's!",
  howToPlay: `Four-Five-Six (also known as Cee-lo or 4-5-6) is a popular street dice game. Roll three dice and try to beat the dealer's point each round.

Instant results: rolling 4-5-6 in any order is an automatic win. Rolling 1-2-3 is an automatic loss. Rolling three-of-a-kind (except three 1s) is also an automatic win; three 1s is a loss.

Point rolls: a pair plus a different value means the odd die is your "point" (1 through 6). The higher the point the better — a point of 6 beats a dealer point of 3. After you set your point, the dealer rolls and the same rules apply to their roll. If you both end up with the same point, the round is a push (no win or loss).

Your score is based on how many rounds you win out of the total. Aim for a high win rate — above 50% is good. The game is partly luck-based but understanding the outcomes can sharpen your strategy in multiplayer variants.`,
  settings: fourFiveSixSettings,
  initialState: (seed: number, settings: FourFiveSixSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state) => {
    const phase = (state as any).phase;
    if (phase === "rolling") return { selector: '[data-testid="hint-target-four-five-six-roll"]', pulses: 3 };
    if (phase === "rolling-dice") return { selector: '[data-testid="hint-target-four-five-six-roll"]', pulses: 3 };
    if (phase === "preRoll") return { selector: '[data-testid="hint-target-four-five-six-roll"]', pulses: 3 };
    if (phase === "ready") return { selector: '[data-testid="hint-target-four-five-six-roll"]', pulses: 3 };
    if (phase === "playerRoll") return { selector: '[data-testid="hint-target-four-five-six-roll"]', pulses: 3 };
    if (phase === "roll") return { selector: '[data-testid="hint-target-four-five-six-roll"]', pulses: 3 };
    if (phase === "play") return { selector: '[data-testid="hint-target-four-five-six-roll"]', pulses: 3 };
    if (phase === "playing") return { selector: '[data-testid="hint-target-four-five-six-roll"]', pulses: 3 };
    if (phase === "roundOver") return { selector: '[data-testid="hint-target-four-five-six-nextRound"]', pulses: 3 };
    if (phase === "result") return { selector: '[data-testid="hint-target-four-five-six-nextRound"]', pulses: 3 };
    if (phase === "settled") return { selector: '[data-testid="hint-target-four-five-six-nextRound"]', pulses: 3 };
    if (phase === "banked") return { selector: '[data-testid="hint-target-four-five-six-nextRound"]', pulses: 3 };
    if (phase === "done") return { selector: '[data-testid="hint-target-four-five-six-nextRound"]', pulses: 3 };
    if (phase === "farkled") return { selector: '[data-testid="hint-target-four-five-six-nextRound"]', pulses: 3 };
    if (phase === "busted") return { selector: '[data-testid="hint-target-four-five-six-nextRound"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-four-five-six-roll"]', pulses: 3 };
  },
  component: FourFiveSix,
};
