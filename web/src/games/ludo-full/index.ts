import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { LudoFullState, LudoFullAction, LudoFullSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";

const LudoFullGame = /* @__PURE__ */ lazy(() =>
  import("./Game.js").then((mod) => ({
    default: mod.LudoFull as unknown as React.ComponentType<unknown>,
  })),
);

const settings = {
  _dummy: { kind: "boolean" as const, label: "_", default: false },
} as const;

type S = SettingsOf<typeof settings>;

export const ludoFullPlugin: GamePlugin<LudoFullState, LudoFullAction, typeof settings> = {
  id: "ludo-full",
  title: "Ludo (Full)",
  category: "board",
  players: { min: 2, max: 4, multiplayer: true },
  description:
    "Full-rulebook Ludo: race four pawns around the cross, roll 6 to release, capture for a bonus.",
  howToPlay: `Ludo is the classic Indian cross-and-circle race. You play Red against three CPU opponents (Blue, Green, Yellow). Each player has four pawns that begin in their starting yard and must race once around the 52-square shared loop before climbing their own six-square home column to the centre.

On your turn, press "Roll" to roll one six-sided die.
- Roll a 6 to release a pawn from the yard onto your start square (or move one of your pawns already on the track).
- Any other roll moves an already-released pawn forward that many squares.
- Rolling a 6 grants an extra turn. Three sixes in a row forfeits the turn.
- Landing on a single opponent pawn on a non-safe square sends it back to its yard.
- Safe squares (the four colored start squares and the four star squares at the column entries) cannot be captured on.
- The home-column squares are private to each color; only your pawns can enter them.
- The final centre square requires an exact roll — overshooting forbids the move.

Win by getting all four of your pawns to the centre before the CPUs.

CPU strategy: prefers to release pawns on a 6, otherwise plays the capture move when available, otherwise advances the pawn furthest along the route.`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as unknown as LudoFullSettings),
  reducer,
  isTerminal,
  hint: (state: LudoFullState): HintTarget | null => {
    if (isTerminal(state) !== null) return null;
    if (state.turn !== 0) return null;
    if (state.phase === "rolling") {
      return { selector: '[data-testid="ludo-full-roll"]', pulses: 3 };
    }
    // Suggest the first legal move button.
    for (let i = 0; i < state.pawns[0]!.length; i++) {
      const pos = state.pawns[0]![i]!;
      if (pos === 57) continue; // already home
      if (pos === -1 && state.die !== 6) continue;
      if (pos !== -1 && pos + state.die > 57) continue;
      return { selector: `[data-testid="ludo-full-move-0-${i}"]`, pulses: 3 };
    }
    return null;
  },
  component: LudoFullGame,
};
