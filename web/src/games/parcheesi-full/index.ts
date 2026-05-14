import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { ParcheesiFullState, ParcheesiFullAction, ParcheesiFullSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";

const ParcheesiFull = /* @__PURE__ */ lazy(() =>
  import("./Game.js").then((mod) => ({
    default: mod.ParcheesiFullGame as unknown as React.ComponentType<unknown>,
  })),
);

const settings = {
  _dummy: { kind: "boolean" as const, label: "_", default: false },
} as const;

type S = SettingsOf<typeof settings>;

export const parcheesiFullPlugin: GamePlugin<ParcheesiFullState, ParcheesiFullAction, typeof settings> = {
  id: "parcheesi-full",
  title: "Parcheesi (Full)",
  category: "board",
  players: { min: 1, max: 4, multiplayer: false },
  description: "Full-rulebook American Pachisi race with blockades, doubles bonuses, captures, and safe spaces.",
  howToPlay: `Parcheesi (Full Rulebook) is a 4-player race game. You (Blue) play against three CPU opponents. Each player has four pawns starting in the yard.

On your turn, click "Roll Dice" to roll two dice. Each die value may move one of your pawns by that many spaces; you may use the dice on the same or different pawns. To bring a pawn out of the yard onto your entry square, you need a 5 — either die showing 5 will do.

If both dice show the same number (doubles), you get an extra turn after using them. Rolling three doubles in a row sends your furthest-back pawn to the yard as a penalty.

Landing on an opponent's pawn on a non-safe square captures it: their pawn goes back to the yard and you earn a 20-square bonus to use this turn. Reaching the center home space adds a 10-square bonus. Bonuses may be split across pawns just like dice.

Two of your own pawns sharing an outer-ring square form a blockade — no pawn (yours or anyone else's) may pass through or land on it. Safe squares (each player's entry plus four shadow safety squares) protect pawns from capture.

The first player to bring all four pawns home wins!`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as unknown as ParcheesiFullSettings),
  reducer,
  isTerminal,
  hint: (state: ParcheesiFullState): HintTarget | null => {
    if (isTerminal(state) !== null) return null;
    if (state.turn !== 0) return null;
    if (state.phase === "rolling") return { selector: '[data-testid="roll-btn"]', pulses: 3 };
    return { selector: '[data-testid="move-btn"]', pulses: 3 };
  },
  component: ParcheesiFull,
};
