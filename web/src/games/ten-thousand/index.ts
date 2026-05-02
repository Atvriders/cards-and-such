import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TenThousandState, TenThousandAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TenThousand } from "./TenThousand.js";

export const tenThousandSettings = {
  target: {
    kind: "enum" as const,
    label: "Target Score",
    options: ["5000", "10000", "15000"] as const,
    default: "10000",
  },
  startingBuy: {
    kind: "enum" as const,
    label: "Starting Buy-In",
    options: ["0", "500", "1000"] as const,
    default: "0",
  },
  botStrategy: {
    kind: "enum" as const,
    label: "Bot Strategy",
    options: ["cautious", "normal", "aggressive"] as const,
    default: "normal",
  },
} as const;

type TenThousandSettingsType = SettingsOf<typeof tenThousandSettings>;

export const tenThousandPlugin: GamePlugin<TenThousandState, TenThousandAction, typeof tenThousandSettings> = {
  id: "ten-thousand",
  title: "Ten Thousand",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Dice race to 10000. Push your luck with hot-dice rolls.",
  howToPlay: `Ten Thousand (also called 10000) is a push-your-luck dice game. Race against the bot to reach the target score (5000, 10000, or 15000) by rolling 6 dice and banking points.

Each turn starts with 6 dice. Roll them all, then select dice to set aside — they must form a valid scoring combination. Scoring: a single 1 = 100, single 5 = 50; three 1s = 1000; three of any other = face × 100; four/five/six of a kind doubles each time. A straight (1-2-3-4-5-6) or three pairs = 1500. Hot dice: if all 6 score and you set them all aside, reset to 6 dice and keep rolling. Bank at any time to lock in your turn score.

Farkle: if a roll produces no scoring dice at all, your turn ends and you lose all points accumulated that turn. Click "Next Turn" to continue after a farkle.

Starting buy-in (if set): you must accumulate at least that many points in a single turn before you can bank for the first time. The bot plays a full turn after each of yours, banking when its turn score reaches its strategy threshold (cautious: 300, normal: 500, aggressive: 700).

Tips: the hot-dice rule means you can theoretically roll forever — but each reroll risks a farkle. Bank when you have a comfortable lead.`,
  settings: tenThousandSettings,
  initialState: (seed: number, settings: TenThousandSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: TenThousandState): HintTarget | null => {
    if (isTerminal(state)) return null;
    const phase = state.currentTurn.phase;
    if (phase === "farkled") {
      return { selector: '[data-testid="hint-target-ten-thousand-next"]', pulses: 3 };
    }
    if (phase === "preRoll") {
      if (state.currentTurn.turnScore > 0) {
        return { selector: '[data-testid="hint-target-ten-thousand-bank"]', pulses: 3 };
      }
      return { selector: '[data-testid="hint-target-ten-thousand-roll"]', pulses: 3 };
    }
    // rolled — must set aside scoring dice
    return { selector: '[data-testid="hint-target-ten-thousand-setaside"]', pulses: 3 };
  },
  component: TenThousand,
};
