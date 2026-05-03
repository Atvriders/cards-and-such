import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf, HintTarget} from "../../platform/game-plugin/types.js";
import type { RaceState, RaceAction, RaceSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const RaceGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.RaceGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const gioulPlugin: GamePlugin<RaceState, RaceAction, typeof settings> = {
  id: "gioul",
  title: "Gioul",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Turkish backgammon variant with cascading double-roll plays.",
  howToPlay: "Gioul is a race game inspired by the backgammon family. Doubles are played, then all higher doublets are played too, then re-roll.\n\nIn this simplified, single-player edition, you play as the white side against a random CPU. Each turn the dice are rolled (two six-sided dice), and you can advance one of your checkers by either die value, or both dice combined. Click any checker that has a legal move and it will jump forward by the available pip count.\n\nThe board is shown as a horizontal track of 24 points. White checkers race from left to right; black checkers (CPU) race from right to left. Each side starts with 15 checkers grouped at the back. When all your checkers cross the finish line you have borne off and the game ends.\n\nScore is calculated from the pip-count differential: how far ahead of your opponent you finish. The CPU plays random legal moves, so a little pip-management gives you a clear edge. Aim to keep your checkers connected, advance the rear runners first, and bear off as quickly as possible. A high score is +30 or better.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as RaceSettings),
  reducer,
  isTerminal, hint: (state: RaceState): HintTarget | null => (state.phase === "rolling" ? { selector: '[data-testid="hint-target-gioul-primary"]', pulses: 3 } : null),
  component: RaceGame,
};
