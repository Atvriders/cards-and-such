import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { QwixxFullState, QwixxFullAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";

const QwixxFullGame = /* @__PURE__ */ lazy(() =>
  import("./Game.js").then((m) => ({
    default: m.QwixxFullGame as unknown as React.ComponentType<unknown>,
  })),
);

const qwixxFullSettings = {
  cpuLevel: {
    kind: "enum" as const,
    label: "CPU Skill",
    options: ["easy", "normal"] as const,
    default: "normal" as const,
  },
} as const;

type QwixxFullSettingsType = SettingsOf<typeof qwixxFullSettings>;

export const qwixxFullPlugin: GamePlugin<
  QwixxFullState,
  QwixxFullAction,
  typeof qwixxFullSettings
> = {
  id: "qwixx-full",
  title: "Qwixx (Full)",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: true },
  description:
    "Roll-and-write scorecard: cross off numbers in 4 colored rows; ascending left-to-right rules force tough choices.",
  howToPlay: `Qwixx (Full) is the complete 3-seat dice-and-scoresheet game: you vs two CPU opponents. Each player has a scorecard with four colored rows — Red and Yellow run 2 to 12 ascending, Green and Blue run 12 to 2 descending.

On each turn the active player rolls six dice (2 white plus one each of red, yellow, green, blue). All three players may cross off the sum of the two white dice in any one row of their card. Additionally, the active player may cross off (one white + one colored die) in that row's color. Crosses must always move left-to-right — you may skip cells, but you may never go back. The rightmost cell of a row (12 for red/yellow, 2 for green/blue) requires at least five prior crosses; landing on it locks the row for every player and counts as an extra cross for scoring.

If the active player makes no cross at all (neither white nor color), they take a penalty worth -5 points. Four locked rows total, or any player reaching 4 penalties, ends the game. Score per row: 1, 3, 6, 10, 15, 21, 28, 36, 45, 55, 66, 78 by cross count (with the lock-bonus included).`,
  settings: qwixxFullSettings,
  initialState: (seed: number, settings: QwixxFullSettingsType) =>
    initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state) => {
    if (isTerminal(state)) return null;
    if (state.phase === "preRoll") {
      return { selector: '[data-testid="qwixx-full-roll"]', pulses: 3 };
    }
    if (state.phase === "rolled" && state.active === 0) {
      return { selector: '[data-testid="qwixx-full-end-turn"]', pulses: 3 };
    }
    return { selector: '[data-testid="qwixx-full-cpu-step"]', pulses: 3 };
  },
  component: QwixxFullGame,
};
