import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { RollRightState, RollRightAction, RollRightSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const RollRightGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.RollRightGame as unknown as React.ComponentType<unknown> })));
export const rollRightSettings = {
  dummy: { kind: "boolean" as const, label: "Standard Rules", default: true },
} as const;

export const rollRightPlugin: GamePlugin<RollRightState, RollRightAction, typeof rollRightSettings> = {
  id: "roll-right",
  title: "Roll Right",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Roll 5 dice, keep the high ones, and be first to score 100.",
  howToPlay: `Roll Right is a push-your-luck dice race for two players — you versus a bot. Both players start at zero. The goal is to be the first to accumulate 100 points.

On your turn, click Roll Dice to roll all five dice. You will see the results as die faces. Click on any dice you want to keep — they turn green. Then you can either click Re-roll Unkept to roll the remaining dice again, or click Score to bank your points now.

Your score for the turn is the sum of all kept dice. If you mark none as kept when scoring, all five dice count. There is no limit on how many times you may reroll, but each reroll replaces the unselected dice with fresh random values — so a die left unselected will change.

The bot plays automatically after you score: it rolls all five, keeps any that show 4, 5, or 6, and banks the total. Click Next Turn to advance after seeing the bot's result.

The first player to reach or exceed 100 points wins. Plan when to be aggressive — sometimes it pays to bank modest scores rather than chase big numbers and waste a turn.`,
  settings: rollRightSettings,
  initialState: (seed, settings) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: RollRightState): HintTarget | null => {
    if (state.winner !== null) return null;
    if (state.currentPlayer !== 0) {
      // Bot's turn — pulse Confirm if available
      if (state.phase === "scored") {
        return { selector: '[data-testid="hint-target-roll-right-confirm"]', pulses: 3 };
      }
      return null;
    }
    if (state.phase === "scored") {
      return { selector: '[data-testid="hint-target-roll-right-confirm"]', pulses: 3 };
    }
    if (state.rollsThisTurn === 0) {
      return { selector: '[data-testid="hint-target-roll-right-roll"]', pulses: 3 };
    }
    // Already rolled — score if any kept high-value dice, else re-roll
    const keptSum = state.dice.reduce((s, v, i) => s + (state.kept[i] ? v : 0), 0);
    if (keptSum >= 12) {
      return { selector: '[data-testid="hint-target-roll-right-score"]', pulses: 3 };
    }
    return { selector: '[data-testid="hint-target-roll-right-roll"]', pulses: 3 };
  },
  component: RollRightGame,
};
