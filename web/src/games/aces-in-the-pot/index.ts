import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { AcesState, AcesAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { AcesInThePot } from "./AcesInThePot.js";

export const acesInThePotSettings = {
  rounds: {
    kind: "enum" as const,
    label: "Rounds",
    options: ["3", "5", "7"] as const,
    default: "5",
  },
} as const;

type AcesSettingsType = SettingsOf<typeof acesInThePotSettings>;

export const acesInThePotPlugin: GamePlugin<AcesState, AcesAction, typeof acesInThePotSettings> = {
  id: "aces-in-the-pot",
  title: "Aces in the Pot",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Classic pub dice game. Roll 2 dice — aces go to the pot, sixes pass pennies to opponents. Last one with pennies wins!",
  howToPlay: `Aces in the Pot is a classic American dice game often played at bars and family gatherings. Each player starts with 3 pennies.

On your turn, roll two dice and apply each die individually:
- Roll a 1 (ace): put one of your pennies into the center pot.
- Roll a 6: pass one of your pennies to the opponent on your left.
- Roll 2–5: no effect for that die.

The first player to run out of pennies loses the round. The surviving player wins the round and collects one point.

In this version you play 1-vs-1 against a bot. Each turn, you roll and the bot rolls in the same round. Whoever empties their pennies first loses. If you lose all your pennies from your own dice roll, the bot wins that round automatically.

After each round, both players reset to 3 pennies. Win the most rounds across 3, 5, or 7 rounds to win the game.

Tip: watch the pot! If both dice cause you to lose pennies (rolling 1+6), things can go south fast. The game swings wildly and is mostly luck — but you'll find yourself cheering for any number from 2 to 5!`,
  settings: acesInThePotSettings,
  initialState: (seed: number, settings: AcesSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state) => {
    if ((state as any).gameOver) return null;
    const phase = (state as any).phase;
    if (phase === "rolling") return { selector: '[data-testid="hint-target-aces-in-the-pot-roll"]', pulses: 3 };
    if (phase === "rolling-dice") return { selector: '[data-testid="hint-target-aces-in-the-pot-roll"]', pulses: 3 };
    if (phase === "preRoll") return { selector: '[data-testid="hint-target-aces-in-the-pot-roll"]', pulses: 3 };
    if (phase === "ready") return { selector: '[data-testid="hint-target-aces-in-the-pot-roll"]', pulses: 3 };
    if (phase === "playerRoll") return { selector: '[data-testid="hint-target-aces-in-the-pot-roll"]', pulses: 3 };
    if (phase === "roll") return { selector: '[data-testid="hint-target-aces-in-the-pot-roll"]', pulses: 3 };
    if (phase === "play") return { selector: '[data-testid="hint-target-aces-in-the-pot-roll"]', pulses: 3 };
    if (phase === "playing") return { selector: '[data-testid="hint-target-aces-in-the-pot-roll"]', pulses: 3 };
    if (phase === "roundOver") return { selector: '[data-testid="hint-target-aces-in-the-pot-nextRound"]', pulses: 3 };
    if (phase === "result") return { selector: '[data-testid="hint-target-aces-in-the-pot-nextRound"]', pulses: 3 };
    if (phase === "settled") return { selector: '[data-testid="hint-target-aces-in-the-pot-nextRound"]', pulses: 3 };
    if (phase === "banked") return { selector: '[data-testid="hint-target-aces-in-the-pot-nextRound"]', pulses: 3 };
    if (phase === "done") return { selector: '[data-testid="hint-target-aces-in-the-pot-nextRound"]', pulses: 3 };
    if (phase === "farkled") return { selector: '[data-testid="hint-target-aces-in-the-pot-nextRound"]', pulses: 3 };
    if (phase === "busted") return { selector: '[data-testid="hint-target-aces-in-the-pot-nextRound"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-aces-in-the-pot-roll"]', pulses: 3 };
  },
  component: AcesInThePot,
};
