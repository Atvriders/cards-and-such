import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceCoinBetState, DiceCoinBetAction, DiceCoinBetSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceCoinBet } from "./Game.js";

const diceCoinBetSettings = {
  rounds: { kind: "enum" as const, label: "Rounds", options: ["10", "20"] as const, default: "10" as const },
} as const;

type DiceCoinBetSettingsType = SettingsOf<typeof diceCoinBetSettings>;

export const diceCoinBetPlugin: GamePlugin<DiceCoinBetState, DiceCoinBetAction, typeof diceCoinBetSettings> = {
  id: "dice-coin-bet",
  title: "Dice Coin Bet",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Roll a die and bet whether the result is odd or even. Grow your coin stack before you go bust!",
  howToPlay: `Dice Coin Bet is a simple betting game with a single die. Each round you decide how many coins to wager, then choose whether you think the die will land on an odd number (1, 3, or 5) or an even number (2, 4, or 6).

You start with 100 coins. A correct odd/even prediction wins your bid; a wrong one loses it. If you go broke before the rounds end, the game finishes early.

Enter your bet in the box and press Odd or Even. The die is rolled instantly and the result shown as a large die face. A green message means you won; red means you lost. Press Next to continue.

Since there are exactly three odd and three even faces on a standard die, it is a true 50/50 bet each time. The key is bankroll management — big bets can win big but a losing streak can wipe you out.

Use Settings to choose 10 or 20 rounds. Your final coin total is your score. Can you double or triple your starting bankroll?`,
  settings: diceCoinBetSettings,
  initialState: (seed: number, settings: DiceCoinBetSettingsType) => initialState(seed, settings as DiceCoinBetSettings),
  reducer,
  isTerminal,
  hint: (state) => {
    const phase = (state as any).phase;
    if (phase === "betting") return { selector: '[data-testid="hint-target-dice-coin-bet-bet"]', pulses: 3 };
    if (phase === "bet") return { selector: '[data-testid="hint-target-dice-coin-bet-bet"]', pulses: 3 };
    if (phase === "roundOver") return { selector: '[data-testid="hint-target-dice-coin-bet-next"]', pulses: 3 };
    if (phase === "result") return { selector: '[data-testid="hint-target-dice-coin-bet-next"]', pulses: 3 };
    if (phase === "settled") return { selector: '[data-testid="hint-target-dice-coin-bet-next"]', pulses: 3 };
    if (phase === "banked") return { selector: '[data-testid="hint-target-dice-coin-bet-next"]', pulses: 3 };
    if (phase === "done") return { selector: '[data-testid="hint-target-dice-coin-bet-next"]', pulses: 3 };
    if (phase === "farkled") return { selector: '[data-testid="hint-target-dice-coin-bet-next"]', pulses: 3 };
    if (phase === "busted") return { selector: '[data-testid="hint-target-dice-coin-bet-next"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-dice-coin-bet-next"]', pulses: 3 };
  },
  component: DiceCoinBet,
};
