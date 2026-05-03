import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { GolfFourShedState, GolfFourShedAction, GolfFourShedSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const GolfFourShedGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.GolfFourShedGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const golfFourShedPlugin: GamePlugin<GolfFourShedState, GolfFourShedAction, typeof settings> = {
  id: "golf-four-shed", title: "Golf (Four-Card)", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Quick scoring golf shedding.",
  howToPlay: "Four-Card Golf is the fastest and simplest version of card-game golf. Each player has a 2x2 grid of face-down cards, peeks at two of them, then tries to swap cards from the deck to lower the visible total.\n\nIn this single-player version you play six holes against the CPU. Each hole you draw and decide whether to swap into your grid or discard. After a fixed number of swaps both grids are revealed and the lower total wins.\n\nLow cards are worth their pip value; jacks are zero, queens and kings are ten. Pairs in the same column cancel to zero. Aces are one. The lower total wins twenty points plus a five-point margin bonus. Across six holes you can score over a hundred with sharp play.\n\nFour-Card Golf is the game children learn first because the grid is small enough to memorise. The CPU plays competently and a typical strong total is sixty to ninety points. Press Play to drive off the tee.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as GolfFourShedSettings),
  reducer, isTerminal, 
  hint: (state: GolfFourShedState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (state.phase === "ready") return { selector: '[data-testid="hint-target-golf-four-shed-play"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-golf-four-shed-next"]', pulses: 3 };
    return null;
  },
  component: GolfFourShedGame,
};
