import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { RollEmState, RollEmAction, RollEmSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const RollEm = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.RollEm as unknown as React.ComponentType<unknown> })));
const settings = {
  rounds: {
    kind: "enum" as const,
    label: "Rounds",
    options: ["3", "5"] as const,
    default: "3" as const,
  },
} as const;

export const rollEmPlugin: GamePlugin<RollEmState, RollEmAction, typeof settings> = {
  id: "roll-em",
  title: "Roll 'Em",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "5-dice poker variant: roll, keep, roll, keep, score. Beat the bot across 3 or 5 rounds.",
  howToPlay: `Roll 'Em is a 5-dice poker game played over 3 or 5 rounds against a simple bot opponent. Each round you try to build the best possible poker hand from five dice.

At the start of each round, all five dice are automatically rolled. You then choose which dice to keep by clicking them (kept dice glow gold). Click Roll to reroll all non-kept dice. You have two additional rolls after the initial one — three rolls total per round.

After your final roll (or whenever you're happy with your hand), click End Turn. The bot plays its own round automatically, then both hands are scored and compared.

Hands from lowest to highest: Nothing (0 pts), One Pair (100), Two Pair (200), Three of a Kind (350), Straight (450), Full House (500), Four of a Kind (700), Five of a Kind (1000). Winning a round against the bot earns an extra 50 bonus points on top of your hand score.

Strategy: with two rerolls, you have decent odds of building at least a pair. Focus on trips or full houses when you see three of a value in your initial roll. Keep a straight-in-progress (e.g., 3-4-5-6) if you only need one more die to complete it. Don't be afraid to sacrifice a pair to chase a straight or full house if you have two rolls left.

The bot uses a simple greedy strategy — keep any pairs, trips, or quads and reroll the rest. Beating the bot consistently earns bonus points that add up across rounds.`,
  settings,
  initialState: (seed: number, s: RollEmSettings) => initialState(seed, s),
  reducer,
  isTerminal,
  hint: (state: RollEmState): HintTarget | null => {
    if (state.gameOver) return null;
    if (state.current.rollsLeft > 0) {
      return { selector: '[data-testid="hint-target-roll-em-roll"]', pulses: 3 };
    }
    return { selector: '[data-testid="hint-target-roll-em-end"]', pulses: 3 };
  },
  component: RollEm,
};
