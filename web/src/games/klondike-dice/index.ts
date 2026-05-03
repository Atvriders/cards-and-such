import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { KlondikeDiceState, KlondikeDiceAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const KlondikeDice = /* @__PURE__ */ lazy(() => import("./KlondikeDice.js").then((mod) => ({ default: mod.KlondikeDice as unknown as React.ComponentType<unknown> })));
export const klondikeDiceSettings = {
  target: {
    kind: "enum" as const,
    label: "Target Score",
    options: ["5", "7", "10"] as const,
    default: "7",
  },
} as const;

type KlondikeDiceSettingsType = SettingsOf<typeof klondikeDiceSettings>;

export const klondikeDicePlugin: GamePlugin<KlondikeDiceState, KlondikeDiceAction, typeof klondikeDiceSettings> = {
  id: "klondike-dice",
  title: "Klondike Dice",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Push your luck rolling a single die — bank before you bust on a 1!",
  howToPlay: `Klondike Dice is a classic push-your-luck game played with a single die. Your goal is to accumulate the target score across multiple turns.

Each turn begins with a "Roll" button. Click it to roll the die. If you roll a 2–6, that value is added to your turn score and you may choose to push your luck and roll again, or bank your accumulated turn score to your total. If you roll a 1 at any point, your entire turn score is lost and the turn ends — you must click "Next Turn" to continue.

The tension is in deciding when to stop: each additional roll risks losing everything built up that turn. A run of good rolls can dramatically boost your score, but greed often leads to busting.

The target score multiplied by 10 is your goal. Reaching it ends the game. Your final score rewards efficiency — fewer turns means a higher result.

Strategy tips: bank early when you have a solid turn score, especially at higher totals. The risk of hitting a 1 is always one-in-six per roll.`,
  settings: klondikeDiceSettings,
  initialState: (seed: number, settings: KlondikeDiceSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state) => {
    const phase = (state as any).phase;
    if (phase === "rolling") return { selector: '[data-testid="hint-target-klondike-dice-roll"]', pulses: 3 };
    if (phase === "rolling-dice") return { selector: '[data-testid="hint-target-klondike-dice-roll"]', pulses: 3 };
    if (phase === "preRoll") return { selector: '[data-testid="hint-target-klondike-dice-roll"]', pulses: 3 };
    if (phase === "ready") return { selector: '[data-testid="hint-target-klondike-dice-roll"]', pulses: 3 };
    if (phase === "playerRoll") return { selector: '[data-testid="hint-target-klondike-dice-roll"]', pulses: 3 };
    if (phase === "roll") return { selector: '[data-testid="hint-target-klondike-dice-roll"]', pulses: 3 };
    if (phase === "play") return { selector: '[data-testid="hint-target-klondike-dice-roll"]', pulses: 3 };
    if (phase === "playing") return { selector: '[data-testid="hint-target-klondike-dice-roll"]', pulses: 3 };
    if (phase === "roundOver") return { selector: '[data-testid="hint-target-klondike-dice-nextTurn"]', pulses: 3 };
    if (phase === "result") return { selector: '[data-testid="hint-target-klondike-dice-nextTurn"]', pulses: 3 };
    if (phase === "settled") return { selector: '[data-testid="hint-target-klondike-dice-nextTurn"]', pulses: 3 };
    if (phase === "banked") return { selector: '[data-testid="hint-target-klondike-dice-nextTurn"]', pulses: 3 };
    if (phase === "done") return { selector: '[data-testid="hint-target-klondike-dice-nextTurn"]', pulses: 3 };
    if (phase === "farkled") return { selector: '[data-testid="hint-target-klondike-dice-nextTurn"]', pulses: 3 };
    if (phase === "busted") return { selector: '[data-testid="hint-target-klondike-dice-nextTurn"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-klondike-dice-roll"]', pulses: 3 };
  },
  component: KlondikeDice,
};
