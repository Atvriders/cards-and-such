import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { UnderOver7State, UnderOver7Action } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { UnderOver7 } from "./UnderOver7.js";

export const underOver7Settings = {
  rounds: {
    kind: "enum" as const,
    label: "Rounds",
    options: ["10", "25", "50"] as const,
    default: "10",
  },
  betSize: {
    kind: "enum" as const,
    label: "Bet Size",
    options: ["10", "25", "100"] as const,
    default: "25",
  },
} as const;

type UO7SettingsType = SettingsOf<typeof underOver7Settings>;

export const underOver7Plugin: GamePlugin<UnderOver7State, UnderOver7Action, typeof underOver7Settings> = {
  id: "under-over-7",
  title: "Under / Over 7",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Simple 2-dice betting game. Guess if the sum is under 7, exactly 7, or over 7. Exactly 7 pays 4:1!",
  howToPlay: `Under/Over 7 is one of the simplest and most popular dice betting games in the world, found at fairs, pubs, and casino floors. You roll two standard dice and bet on the total before they land.

Three betting options:
- Under 7: Win if the dice total 2, 3, 4, 5, or 6. Pays 1:1.
- Exactly 7: Win if the dice total exactly 7. Pays 4:1!
- Over 7: Win if the dice total 8, 9, 10, 11, or 12. Pays 1:1.

The probability breakdown: Under 7 and Over 7 each have a 15/36 (~41.7%) chance of winning. Exactly 7 has a 6/36 (~16.7%) chance — but pays 4:1 which makes it tempting.

Start with 1,000 in your bankroll. Each round, pick your bet, click it, and the dice are rolled instantly. The result and updated bankroll display immediately. Then click Next Round to continue.

Strategy tip: Under and Over are nearly symmetrical. The house advantage in real casinos comes from the payouts being slightly less than true odds. Here it's all fair — enjoy chasing that 7 for the big 4:1 payout! Play 10, 25, or 50 rounds and see how much you can accumulate.`,
  settings: underOver7Settings,
  initialState: (seed: number, settings: UO7SettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state) => {
    if ((state as any).gameOver) return null;
    const phase = (state as any).phase;
    if (phase === "betting") return { selector: '[data-testid="hint-target-under-over-7-bet"]', pulses: 3 };
    if (phase === "bet") return { selector: '[data-testid="hint-target-under-over-7-bet"]', pulses: 3 };
    if (phase === "roundOver") return { selector: '[data-testid="hint-target-under-over-7-next"]', pulses: 3 };
    if (phase === "result") return { selector: '[data-testid="hint-target-under-over-7-next"]', pulses: 3 };
    if (phase === "settled") return { selector: '[data-testid="hint-target-under-over-7-next"]', pulses: 3 };
    if (phase === "banked") return { selector: '[data-testid="hint-target-under-over-7-next"]', pulses: 3 };
    if (phase === "done") return { selector: '[data-testid="hint-target-under-over-7-next"]', pulses: 3 };
    if (phase === "farkled") return { selector: '[data-testid="hint-target-under-over-7-next"]', pulses: 3 };
    if (phase === "busted") return { selector: '[data-testid="hint-target-under-over-7-next"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-under-over-7-next"]', pulses: 3 };
  },
  component: UnderOver7,
};
