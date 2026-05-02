import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CrownAndAnchorState, CrownAndAnchorAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CrownAndAnchor } from "./CrownAndAnchor.js";

export const crownAndAnchorSettings = {
  startingCoins: {
    kind: "enum" as const,
    label: "Starting Coins",
    options: ["10", "20", "50"] as const,
    default: "20",
  },
} as const;

type CrownAndAnchorSettingsType = SettingsOf<typeof crownAndAnchorSettings>;

export const crownAndAnchorPlugin: GamePlugin<CrownAndAnchorState, CrownAndAnchorAction, typeof crownAndAnchorSettings> = {
  id: "crown-and-anchor",
  title: "Crown and Anchor",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Bet on a symbol and roll 3 special dice — win coins for each matching face!",
  howToPlay: `Crown and Anchor is a traditional British naval gambling dice game played at fairs and aboard ships for centuries. Three dice each show six symbols: Crown, Anchor, Heart, Diamond, Club, and Spade.

Each round, pick your symbol and place a bet. Then roll the three dice. For each die that shows your chosen symbol, you win your bet amount back as profit. Two matches returns 2x your bet; three matches returns 3x. If no dice match, you lose your bet entirely.

The house edge is real — on average each round you lose a small fraction of your bet — but lucky streaks can rapidly build your coins. Bet small to survive longer; bet big when feeling lucky.

The game ends when you run out of coins. Your score reflects how many rounds you survived, rewarding persistence. With a starting stack of 20 coins and careful 1-coin bets you can play for dozens of rounds. Raise your bet only when you have a comfortable cushion.`,
  settings: crownAndAnchorSettings,
  initialState: (seed: number, settings: CrownAndAnchorSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state) => {
    const phase = (state as any).phase;
    if (phase === "rolling") return { selector: '[data-testid="hint-target-crown-and-anchor-roll"]', pulses: 3 };
    if (phase === "rolling-dice") return { selector: '[data-testid="hint-target-crown-and-anchor-roll"]', pulses: 3 };
    if (phase === "preRoll") return { selector: '[data-testid="hint-target-crown-and-anchor-roll"]', pulses: 3 };
    if (phase === "ready") return { selector: '[data-testid="hint-target-crown-and-anchor-roll"]', pulses: 3 };
    if (phase === "playerRoll") return { selector: '[data-testid="hint-target-crown-and-anchor-roll"]', pulses: 3 };
    if (phase === "roll") return { selector: '[data-testid="hint-target-crown-and-anchor-roll"]', pulses: 3 };
    if (phase === "play") return { selector: '[data-testid="hint-target-crown-and-anchor-roll"]', pulses: 3 };
    if (phase === "playing") return { selector: '[data-testid="hint-target-crown-and-anchor-roll"]', pulses: 3 };
    if (phase === "roundOver") return { selector: '[data-testid="hint-target-crown-and-anchor-nextRound"]', pulses: 3 };
    if (phase === "result") return { selector: '[data-testid="hint-target-crown-and-anchor-nextRound"]', pulses: 3 };
    if (phase === "settled") return { selector: '[data-testid="hint-target-crown-and-anchor-nextRound"]', pulses: 3 };
    if (phase === "banked") return { selector: '[data-testid="hint-target-crown-and-anchor-nextRound"]', pulses: 3 };
    if (phase === "done") return { selector: '[data-testid="hint-target-crown-and-anchor-nextRound"]', pulses: 3 };
    if (phase === "farkled") return { selector: '[data-testid="hint-target-crown-and-anchor-nextRound"]', pulses: 3 };
    if (phase === "busted") return { selector: '[data-testid="hint-target-crown-and-anchor-nextRound"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-crown-and-anchor-roll"]', pulses: 3 };
  },
  component: CrownAndAnchor,
};
