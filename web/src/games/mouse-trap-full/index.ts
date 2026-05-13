import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type {
  MouseTrapFullAction,
  MouseTrapFullSettings,
  MouseTrapFullState,
} from "./state.js";
import { initialState, isTerminal, reducer } from "./state.js";

const MouseTrapFullGame = /* @__PURE__ */ lazy(() =>
  import("./Game.js").then((mod) => ({
    default: mod.MouseTrapFullGame as unknown as React.ComponentType<unknown>,
  })),
);

const settings = {
  _dummy: { kind: "boolean" as const, label: "(reserved)", default: false },
} as const;
type S = SettingsOf<typeof settings>;

export const mouseTrapFullPlugin: GamePlugin<MouseTrapFullState, MouseTrapFullAction, typeof settings> = {
  id: "mouse-trap-full",
  title: "Mouse Trap (Full Build)",
  category: "board",
  players: { min: 1, max: 4, multiplayer: false },
  description:
    "Build the Rube Goldberg trap one part at a time, then race to crank the crane onto your opponent's mouse.",
  howToPlay: `Mouse Trap (Full Build) is the classic Rube Goldberg race for 1 human and 3 CPU opponents on a 24-square loop board.

Each turn the active player rolls a six-sided die and moves their mouse pawn forward that many squares (wrapping around). Squares 1-8 are the eight main trap parts — Crank, Stop Sign, Shoe, Bucket, Rod, Ball, Bathtub, and Diver. The first mouse to land on each of those squares contributes that part to the communal trap.

Once all eight main parts have been built (cumulative across all players), the trap is ARMED. From then on, whenever any player lands on the Cheese Wheel (square 19), they crank the crane — every mouse currently parked on the trigger-cage track squares (16, 17, 18, 20, 21) is caught and removed from the board.

Last uncaught mouse wins. Your score is +50 per opponent you personally catch plus a +100 bonus if you are the final survivor.

L→M tier notes: the classic between-turn dice mini-game (roll-for-part vs roll-to-skip) is replaced with a deterministic square→effect mapping so each landing has a clear outcome. Extra scenery squares (Helping Hand, Wheel, Tub Stopper, etc.) are part of the board art but do not independently arm the trap. Advanced rules omitted: the explicit "cheese-stealing" turn-trigger card mini-game and the variant where a mouse can voluntarily walk onto the cage track.`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as MouseTrapFullSettings),
  reducer,
  isTerminal,
  hint: (state: MouseTrapFullState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.current !== 0) return null; // it's a CPU's move
    if (state.phase === "rolling") return { selector: '[data-testid="hint-target-mouse-trap-full-roll"]', pulses: 3 };
    if (state.phase === "resolved") return { selector: '[data-testid="hint-target-mouse-trap-full-next"]', pulses: 3 };
    return null;
  },
  component: MouseTrapFullGame,
};
