import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { CarromState, CarromAction, CarromSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";

const CarromFullGame = /* @__PURE__ */ lazy(() =>
  import("./Game.js").then((mod) => ({ default: mod.CarromFullGame as unknown as React.ComponentType<unknown> }))
);

const settings = {
  _dummy: { kind: "boolean" as const, label: "_dummy", default: false },
} as const;
type S = SettingsOf<typeof settings>;

export const carromFullPlugin: GamePlugin<CarromState, CarromAction, typeof settings> = {
  id: "carrom-full",
  title: "Carrom (Full)",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Flick the striker, pocket your color and the queen — full carrom vs. a CPU.",
  howToPlay:
    "Carrom is the classic South Asian flick-and-pocket board game. A square board with four corner pockets holds 19 carrom men: 9 white, 9 black, and one red queen at center. " +
    "You play White; the CPU plays Black. On your turn, aim and choose a power between 1 and 10, then flick the striker. " +
    "Pocketing a piece of your own color earns one point and lets you shoot again. " +
    "Pocketing the queen is worth +3 but must be 'covered' by pocketing one of your own pieces in the same shot or your very next shot — otherwise the queen returns to the board. " +
    "Pocketing only an opponent's piece is a foul: one of your own pocketed pieces returns to the board (or you owe a penalty if none is available), and your turn ends. " +
    "Win by pocketing all 9 of your pieces with the queen covered. The reduced-physics shot resolution is deterministic from your aim and power, so practice helps. " +
    "Advanced rules omitted: real billiards physics, striker placement on the baseline, board-match scoring, and the 'due' carryover when multiple penalties accumulate.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as CarromSettings),
  reducer,
  isTerminal,
  hint: (state: CarromState): HintTarget | null => {
    if (isTerminal(state) !== null) return null;
    if (state.phase === "aim" && state.turn === "P") {
      return { selector: '[data-testid="cf-shoot"]', pulses: 3 };
    }
    return null;
  },
  component: CarromFullGame,
};
