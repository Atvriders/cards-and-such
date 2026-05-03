import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceTwinBetState, DiceTwinBetAction, DiceTwinBetSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceTwinBet } from "./Game.js";

const diceTwinBetSettings = {
  rounds: { kind: "enum" as const, label: "Rounds", options: ["8", "10", "12"] as const, default: "10" as const },
} as const;

type S = SettingsOf<typeof diceTwinBetSettings>;

export const diceTwinBetPlugin: GamePlugin<DiceTwinBetState, DiceTwinBetAction, typeof diceTwinBetSettings> = {
  id: "dice-twin-bet",
  title: "Dice Twin Bet",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Before rolling two dice, bet whether they will land on matching faces. Rare twin matches pay big — 50 points! Safe no-match bets pay 15.",
  howToPlay: `Dice Twin Bet is a probability challenge. Each round, two six-sided dice are ready to roll. Before they roll, you must predict the outcome: will both dice show the SAME face (a twin), or will they show DIFFERENT faces?

Betting MATCH and being right earns you 50 points — but twins happen only about 1 in 6 rolls, so this is a risky call. Betting NO MATCH and being right earns 15 points — safer, since no-match is the expected outcome most of the time. A wrong bet earns nothing.

The game rewards risk-takers who consistently call twins correctly, but careful conservative players can also rack up points by consistently calling no-match.

Use Settings to choose 8, 10, or 12 rounds. Final score is displayed when all rounds are complete. Do you feel the twins today?`,
  settings: diceTwinBetSettings,
  initialState: (seed: number, s: S) => initialState(seed, s as DiceTwinBetSettings),
  reducer, isTerminal, component: DiceTwinBet,
  hint: (state: DiceTwinBetState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "betting") return { selector: '[data-testid="hint-target-dicetwin-bet"]', pulses: 3 };
    if (state.phase === "reveal") return { selector: '[data-testid="hint-target-dicetwin-next"]', pulses: 3 };
    return null;
  },
};
