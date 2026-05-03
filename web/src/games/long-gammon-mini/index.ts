import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf, HintTarget} from "../../platform/game-plugin/types.js";
import type { RaceState, RaceAction, RaceSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const RaceGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.RaceGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const longGammonMiniPlugin: GamePlugin<RaceState, RaceAction, typeof settings> = {
  id: "long-gammon-mini",
  title: "Long Gammon (Mini)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Bear off only after all checkers reach your home board on a compact track.",
  howToPlay: "Long Gammon is a backgammon variant that emphasizes the racing portion of the game. Bearing off cannot begin until all your checkers have reached the home quadrant. This Mini edition shortens the track to 20 points with 12 checkers per side, making it quicker to play.\n\nYou play white against a random CPU. Click Roll to throw two dice; then click any of your twelve checkers and choose to advance it by either die or by the combined value. Both dice must be used each turn when possible. Cell 20 is the bear-off zone.\n\nThe board is displayed as a single horizontal track. White checkers race left to right while the CPU's black checkers race right to left.\n\nLong Gammon rewards patience: avoid leaving stranded back-runners since they cannot be left behind once others bear off. The CPU plays random legal moves, so a methodical advance strategy consistently outpaces it. Final score is the pip-count differential at game end. Bearing off all checkers cleanly earns 100 points plus your pip lead.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as RaceSettings),
  reducer,
  isTerminal, hint: (state: RaceState): HintTarget | null => (state.phase === "rolling" ? { selector: '[data-testid="hint-target-long-gammon-mini-primary"]', pulses: 3 } : null),
  component: RaceGame,
};
