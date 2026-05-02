import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ChicagoState, ChicagoAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ChicagoDice } from "./ChicagoDice.js";

export const chicagoDiceSettings = {
  rounds: {
    kind: "enum" as const,
    label: "Rounds",
    options: ["11"] as const,
    default: "11",
  },
} as const;

type ChicagoDiceSettingsType = SettingsOf<typeof chicagoDiceSettings>;

export const chicagoDicePlugin: GamePlugin<ChicagoState, ChicagoAction, typeof chicagoDiceSettings> = {
  id: "chicago-dice",
  title: "Chicago (Dice)",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "11-round push-your-luck game vs a bot. Each round has a target sum (2–12). Roll 2 dice — if they hit the target, score those points. Highest total after all 11 rounds wins.",
  howToPlay: `Chicago is a simple and fast 2-dice game played over exactly 11 rounds. Each round corresponds to one target number, starting at 2 and increasing to 12.

Your goal each round is simple: roll two dice and hope they add up to the current target number. If they do, you score that many points. If they don't, you score nothing. The bot does the same thing simultaneously, using its own roll.

After all 11 rounds, the player with the most points wins. The game is mostly luck — later rounds (high targets like 10, 11, 12) are hard to hit but worth more points. Round 7 (target 7) is the most likely to score since 7 is the most common sum of two dice.

To play: click "Roll Dice" to resolve the round for both you and the bot. The result is shown immediately, then click "Next Round" to advance. After round 11 (target 12), the final scores are compared.

Possible totals range from 0 (miss every round) to 77 (hit every round: 2+3+4+5+6+7+8+9+10+11+12). A typical game lands somewhere in the 20–35 range for each player.

It's pure dice luck — a great warm-up game or a way to practice reading dice probabilities.`,
  settings: chicagoDiceSettings,
  initialState: (seed: number, settings: ChicagoDiceSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state) => {
    if ((state as any).gameOver) return null;
    const phase = (state as any).phase;
    if (phase === "rolling") return { selector: '[data-testid="hint-target-chicago-dice-roll"]', pulses: 3 };
    if (phase === "rolling-dice") return { selector: '[data-testid="hint-target-chicago-dice-roll"]', pulses: 3 };
    if (phase === "preRoll") return { selector: '[data-testid="hint-target-chicago-dice-roll"]', pulses: 3 };
    if (phase === "ready") return { selector: '[data-testid="hint-target-chicago-dice-roll"]', pulses: 3 };
    if (phase === "playerRoll") return { selector: '[data-testid="hint-target-chicago-dice-roll"]', pulses: 3 };
    if (phase === "roll") return { selector: '[data-testid="hint-target-chicago-dice-roll"]', pulses: 3 };
    if (phase === "play") return { selector: '[data-testid="hint-target-chicago-dice-roll"]', pulses: 3 };
    if (phase === "playing") return { selector: '[data-testid="hint-target-chicago-dice-roll"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-chicago-dice-roll"]', pulses: 3 };
  },
  component: ChicagoDice,
};
