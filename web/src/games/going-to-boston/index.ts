import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GoingToBostonState, GoingToBostonAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const GoingToBoston = /* @__PURE__ */ lazy(() => import("./GoingToBoston.js").then((mod) => ({ default: mod.GoingToBoston as unknown as React.ComponentType<unknown> })));
export const goingToBostonSettings = {
  rounds: {
    kind: "enum" as const,
    label: "Rounds",
    options: ["3", "5", "7"] as const,
    default: "5",
  },
} as const;

type GoingToBostonSettingsType = SettingsOf<typeof goingToBostonSettings>;

export const goingToBostonPlugin: GamePlugin<GoingToBostonState, GoingToBostonAction, typeof goingToBostonSettings> = {
  id: "going-to-boston",
  title: "Going to Boston",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Roll 3 dice three times — keep the highest each time and sum all three kept dice!",
  howToPlay: `Going to Boston (also called Newmarket or Yankee Grab) is a classic dice game where you roll three dice and keep the highest die each time, rolling the remaining dice up to three total rolls.

Each round proceeds in three steps. First, roll all three dice and the highest value is automatically kept aside. Second, roll the two remaining dice and keep the highest of those. Third, roll the one remaining die — it is your final kept die. Your round score is the sum of all three kept dice, giving a minimum of 3 and maximum of 18.

After completing all rounds, your total score is the sum of all round scores. The game ends when all rounds are finished. Higher totals indicate better luck and judgment.

Aim to complete your chosen number of rounds — three, five, or seven — and rack up the highest possible cumulative total. On average each round scores about 12–14 points. A perfect game (all sixes) would yield 18 per round.`,
  settings: goingToBostonSettings,
  initialState: (seed: number, settings: GoingToBostonSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state) => {
    const phase = (state as any).phase;
    if (phase === "rolling") return { selector: '[data-testid="hint-target-going-to-boston-roll"]', pulses: 3 };
    if (phase === "rolling-dice") return { selector: '[data-testid="hint-target-going-to-boston-roll"]', pulses: 3 };
    if (phase === "preRoll") return { selector: '[data-testid="hint-target-going-to-boston-roll"]', pulses: 3 };
    if (phase === "ready") return { selector: '[data-testid="hint-target-going-to-boston-roll"]', pulses: 3 };
    if (phase === "playerRoll") return { selector: '[data-testid="hint-target-going-to-boston-roll"]', pulses: 3 };
    if (phase === "roll") return { selector: '[data-testid="hint-target-going-to-boston-roll"]', pulses: 3 };
    if (phase === "play") return { selector: '[data-testid="hint-target-going-to-boston-roll"]', pulses: 3 };
    if (phase === "playing") return { selector: '[data-testid="hint-target-going-to-boston-roll"]', pulses: 3 };
    if (phase === "roundOver") return { selector: '[data-testid="hint-target-going-to-boston-nextRound"]', pulses: 3 };
    if (phase === "result") return { selector: '[data-testid="hint-target-going-to-boston-nextRound"]', pulses: 3 };
    if (phase === "settled") return { selector: '[data-testid="hint-target-going-to-boston-nextRound"]', pulses: 3 };
    if (phase === "banked") return { selector: '[data-testid="hint-target-going-to-boston-nextRound"]', pulses: 3 };
    if (phase === "done") return { selector: '[data-testid="hint-target-going-to-boston-nextRound"]', pulses: 3 };
    if (phase === "farkled") return { selector: '[data-testid="hint-target-going-to-boston-nextRound"]', pulses: 3 };
    if (phase === "busted") return { selector: '[data-testid="hint-target-going-to-boston-nextRound"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-going-to-boston-roll"]', pulses: 3 };
  },
  component: GoingToBoston,
};
