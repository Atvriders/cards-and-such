import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { OperationFullState, OperationFullAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";

const OperationFullGame = /* @__PURE__ */ lazy(() =>
  import("./Game.js").then((mod) => ({ default: mod.OperationFullGame as unknown as React.ComponentType<unknown> })),
);

export const operationFullSettings = {
  difficulty: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "normal", "hard"] as const,
    default: "normal" as const,
  },
} as const;

type OperationFullSettingsType = SettingsOf<typeof operationFullSettings>;

export const operationFullPlugin: GamePlugin<OperationFullState, OperationFullAction, typeof operationFullSettings> = {
  id: "operation-full",
  title: "Operation (Full Specialist)",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "The full Cavity-Sam round with 12 ailments, doctor cards, and the dreaded buzzer for each twitch.",
  howToPlay: `Operation (Full Specialist) recreates the full Cavity-Sam round.

There are 12 classic ailments to extract: Adam's Apple, Bread Basket, Wish Bone, Funny Bone, Butterflies in Stomach, Charley Horse, Wrenched Ankle, Spare Ribs, Broken Heart, Brain Freeze, Writer's Cramp, and Water on the Knee. Each ailment is worth a fee in points.

Each turn you may draw a Doctor Specialist card. It can grant a free bonus, double your fee, give you a steady hand (larger tolerance), force a rush job (less time but extra reward), waive a buzz, or grant a second opinion (a miss returns the ailment to the queue).

Then press "Begin Extraction" — the body cavity opens. With your mouse or finger, slide the tweezer cursor into the small tolerance circle around the ailment without touching the cavity edges. You have a few seconds. If you touch an edge the buzzer sounds and you take a strike. If time runs out it counts as a miss. Land in the tolerance zone and you collect the fee.

The round ends when all 12 ailments have been resolved OR after 3 buzzer failures. Your score is the sum of fees collected — the dreaded buzzer adds up fast!`,
  settings: operationFullSettings,
  initialState: (seed: number, settings: OperationFullSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: OperationFullState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "ready") return { selector: '[data-testid="op-full-draw"]', pulses: 3 };
    if (state.phase === "drawing") return { selector: '[data-testid="op-full-start"]', pulses: 3 };
    if (state.phase === "active") return { selector: '[data-testid="op-full-tolerance"]', pulses: 3 };
    if (state.phase === "result") return { selector: '[data-testid="op-full-next"]', pulses: 3 };
    return null;
  },
  component: OperationFullGame,
};
