import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DicePokerState, DicePokerAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const DicePoker = /* @__PURE__ */ lazy(() => import("./DicePoker.js").then((mod) => ({ default: mod.DicePoker as unknown as React.ComponentType<unknown> })));
export const dicePokerSettings = {
  winScore: {
    kind: "enum" as const,
    label: "Points to Win",
    options: ["3", "5", "7"] as const,
    default: "5",
  },
} as const;

type DicePokerSettingsType = SettingsOf<typeof dicePokerSettings>;

export const dicePokerPlugin: GamePlugin<DicePokerState, DicePokerAction, typeof dicePokerSettings> = {
  id: "dice-poker",
  title: "Dice Poker",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Poker hands with 5 special dice (faces: 9, 10, J, Q, K, A). Roll up to 3 times, keep your best dice, then compare poker hands against the bot. First to 5 points wins.",
  howToPlay: `Dice Poker uses five special dice with card faces: 9, 10, Jack, Queen, King, and Ace. Each round you roll up to 3 times and try to build the best poker hand to beat the bot.

Click "Roll Dice" to roll all five dice. After the first roll, click individual dice to keep (lock) them — kept dice glow green. Then click "Re-roll" to reroll the unlocked dice. You get up to 3 rolls total per round. At any point after your first roll, you can click "Bank This Hand" to end your turn with your current dice.

After you finish rolling (or bank early), the bot automatically plays its turn using up to 3 rolls with a greedy strategy. Your hands are then revealed and compared.

Poker hand rankings (highest to lowest): Five of a Kind, Four of a Kind, Full House, Straight (5 consecutive ranks), Three of a Kind, Two Pair, One Pair, High Card.

Ties are broken by the total value of dice. The winner of each round earns 1 point. First player to reach the points target (default 5) wins the match.

Strategy: Keep pairs and high cards from your first roll. Straights are tricky since the faces run 9–A, but 9-10-J-Q-K and 10-J-Q-K-A are both valid. Three of a Kind is often easier to build than a Full House when starting from a pair.`,
  settings: dicePokerSettings,
  initialState: (seed: number, settings: DicePokerSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state) => {
    if ((state as any).gameOver) return null;
    const phase = (state as any).phase;
    if (phase === "rolling") return { selector: '[data-testid="hint-target-dice-poker-roll"]', pulses: 3 };
    if (phase === "rolling-dice") return { selector: '[data-testid="hint-target-dice-poker-roll"]', pulses: 3 };
    if (phase === "preRoll") return { selector: '[data-testid="hint-target-dice-poker-roll"]', pulses: 3 };
    if (phase === "ready") return { selector: '[data-testid="hint-target-dice-poker-roll"]', pulses: 3 };
    if (phase === "playerRoll") return { selector: '[data-testid="hint-target-dice-poker-roll"]', pulses: 3 };
    if (phase === "roll") return { selector: '[data-testid="hint-target-dice-poker-roll"]', pulses: 3 };
    if (phase === "play") return { selector: '[data-testid="hint-target-dice-poker-roll"]', pulses: 3 };
    if (phase === "playing") return { selector: '[data-testid="hint-target-dice-poker-roll"]', pulses: 3 };
    if (phase === "roundOver") return { selector: '[data-testid="hint-target-dice-poker-nextRound"]', pulses: 3 };
    if (phase === "result") return { selector: '[data-testid="hint-target-dice-poker-nextRound"]', pulses: 3 };
    if (phase === "settled") return { selector: '[data-testid="hint-target-dice-poker-nextRound"]', pulses: 3 };
    if (phase === "banked") return { selector: '[data-testid="hint-target-dice-poker-nextRound"]', pulses: 3 };
    if (phase === "done") return { selector: '[data-testid="hint-target-dice-poker-nextRound"]', pulses: 3 };
    if (phase === "farkled") return { selector: '[data-testid="hint-target-dice-poker-nextRound"]', pulses: 3 };
    if (phase === "busted") return { selector: '[data-testid="hint-target-dice-poker-nextRound"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-dice-poker-roll"]', pulses: 3 };
  },
  component: DicePoker,
};
