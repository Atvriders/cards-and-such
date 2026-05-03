import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { FiveDiceState, FiveDiceAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const FiveDiceShootout = /* @__PURE__ */ lazy(() => import("./FiveDiceShootout.js").then((mod) => ({ default: mod.FiveDiceShootout as unknown as React.ComponentType<unknown> })));
export const fiveDiceSettings = {
  bestOf: {
    kind: "enum" as const,
    label: "Best Of",
    options: ["3", "5", "7"] as const,
    default: "5",
  },
} as const;

type FiveDiceSettingsType = SettingsOf<typeof fiveDiceSettings>;

export const fiveDiceShootoutPlugin: GamePlugin<FiveDiceState, FiveDiceAction, typeof fiveDiceSettings> = {
  id: "five-dice-shootout",
  title: "Five Dice Shootout",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Quick duel: you and the bot each roll 5 dice. Highest total wins the round. Best of 3, 5, or 7!",
  howToPlay: `Five Dice Shootout is a fast and exciting head-to-head dice duel. The rules couldn't be simpler: you and the bot each roll five standard six-sided dice. The player with the higher total sum wins the round.

Possible sums range from 5 (all ones) to 30 (all sixes). The average roll is about 17–18. Ties are rare but possible — in the case of a tie, neither player gets a win for that round.

The match is played best-of-3, best-of-5, or best-of-7. Win more rounds than the bot to win the game.

Each round:
1. Click "Roll 5 Dice!" — both your dice and the bot's dice are rolled simultaneously.
2. Your total and the bot's total are compared.
3. Higher total wins the round.
4. Click "Next Round" to continue.

The score table tracks each round's results. Watch out for streaks — the bot can get lucky runs of high rolls!

There's no strategy beyond rolling — it's pure dice luck. But that's what makes it exciting. A comeback from 0–2 in a best-of-5 is always possible as long as you keep rolling. Three lucky rolls and you've won!`,
  settings: fiveDiceSettings,
  initialState: (seed: number, settings: FiveDiceSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
    hint: (state: FiveDiceState) => {
      if (isTerminal(state)) return null;
      if (state.phase === "roundOver") return { selector: '[data-testid="hint-target-five-dice-shootout-next"]', pulses: 3 };
      return { selector: '[data-testid="hint-target-five-dice-shootout-action"]', pulses: 3 };
    },
  component: FiveDiceShootout,
};
