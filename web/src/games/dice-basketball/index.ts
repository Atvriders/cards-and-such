import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceBasketballState, DiceBasketballAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const DiceBasketball = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.DiceBasketball as unknown as React.ComponentType<unknown> })));
export const diceBasketballSettings = {
  periods: {
    kind: "enum" as const,
    label: "Periods",
    options: ["2", "4"] as const,
    default: "2" as const,
  },
} as const;

type DiceBasketballSettingsType = SettingsOf<typeof diceBasketballSettings>;

export const diceBasketballPlugin: GamePlugin<DiceBasketballState, DiceBasketballAction, typeof diceBasketballSettings> = {
  id: "dice-basketball",
  title: "Dice Basketball",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Choose your shots and roll dice to outscore the AI in a fast-paced dice basketball game.",
  howToPlay: `Dice Basketball lets you pick your offensive strategy while dice determine the outcome. After each of your shots, the AI automatically takes its own turn.

Choose from four shot types each possession. A Layup rolls 1d6 — score 2 points on a roll of 3 or higher. A Mid-Range jumper rolls 2d6 — score 2 points if the sum is 8 or more. A Three-Pointer rolls 2d6 — score 3 points only if the sum reaches 10 or more. Free Throws roll 2d6 separately — each die scores 1 point on a 4 or higher, for up to 2 points.

After your shot, the AI plays out its own possession automatically — it may score, miss, or turn it over.

Manage your risk versus reward. Safe shots (layups) score consistently. Riskier shots (three-pointers) can swing the game if they land. If you are losing near the end, attack with three-pointers. If you are ahead, take safe layups to protect your lead.

Score: 1000 for a win, 500 for a tie, 100 for a loss.`,
  settings: diceBasketballSettings,
  initialState: (seed: number, settings: DiceBasketballSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state) => {
    if ((state as any).gameOver) return null;
    const phase = (state as any).phase;
    if (phase === "rolling") return { selector: '[data-testid="hint-target-dice-basketball-shoot"]', pulses: 3 };
    if (phase === "rolling-dice") return { selector: '[data-testid="hint-target-dice-basketball-shoot"]', pulses: 3 };
    if (phase === "preRoll") return { selector: '[data-testid="hint-target-dice-basketball-shoot"]', pulses: 3 };
    if (phase === "ready") return { selector: '[data-testid="hint-target-dice-basketball-shoot"]', pulses: 3 };
    if (phase === "playerRoll") return { selector: '[data-testid="hint-target-dice-basketball-shoot"]', pulses: 3 };
    if (phase === "roll") return { selector: '[data-testid="hint-target-dice-basketball-shoot"]', pulses: 3 };
    if (phase === "play") return { selector: '[data-testid="hint-target-dice-basketball-shoot"]', pulses: 3 };
    if (phase === "playing") return { selector: '[data-testid="hint-target-dice-basketball-shoot"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-dice-basketball-shoot"]', pulses: 3 };
  },
  component: DiceBasketball,
};
