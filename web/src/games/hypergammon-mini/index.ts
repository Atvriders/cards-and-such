import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf, HintTarget} from "../../platform/game-plugin/types.js";
import type { RaceState, RaceAction, RaceSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const RaceGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.RaceGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const hypergammonMiniPlugin: GamePlugin<RaceState, RaceAction, typeof settings> = {
  id: "hypergammon-mini",
  title: "Hypergammon (Mini)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Highly tactical hyper-fast backgammon: only three checkers per side.",
  howToPlay: "Hypergammon is the most tactical backgammon variant — each player has only three checkers, all starting on the back point. Every move matters because exposing a single blot is often catastrophic. This Mini implementation models the race aspect on a compact 18-point track with three checkers per side.\n\nYou play white against a random CPU. Click Roll to throw the two dice. Then click any of your three checkers and move it forward by either die value or by the combined sum. Each die is used at most once per turn. The cell past the last point is the bear-off zone.\n\nThe board is laid out as a horizontal track. White checkers race left to right while the CPU's black runners race right to left. With only three checkers each, games end quickly.\n\nWith such a low piece count, every pip is precious. Plan combined-die moves carefully — sometimes splitting the dice across two checkers gets a blot to safety faster than running a single piece. Final score is your pip-count differential. Race all three checkers home to win.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as RaceSettings),
  reducer,
  isTerminal, hint: (state: RaceState): HintTarget | null => (state.phase === "rolling" ? { selector: '[data-testid="hint-target-hypergammon-mini-primary"]', pulses: 3 } : null),
  component: RaceGame,
};
