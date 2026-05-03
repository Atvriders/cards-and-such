import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf, HintTarget} from "../../platform/game-plugin/types.js";
import type { RaceState, RaceAction, RaceSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const RaceGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.RaceGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const uckersRacePlugin: GamePlugin<RaceState, RaceAction, typeof settings> = {
  id: "uckers-race",
  title: "Uckers",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Royal Navy Ludo variant; race four pieces home.",
  howToPlay: "Uckers is the Royal Navy's Ludo variant, played at sea with strict block rules; this rendition is a simplified race. In this lightweight single-player edition you race against a random CPU opponent. On your turn you roll two six-sided dice. You may move any checker forward by one die value, or by both dice combined. Click the matching button on a checker to commit the move. Once both dice are spent your turn ends and the CPU rolls. The board shows a horizontal track of 24 points; player tokens are red and CPU tokens are dark. Each side starts with 4 checkers at point zero. The first side to push every checker past the final point wins the match. Scoring rewards a win heavily: a victory grants 100 points plus a pip-count bonus equal to how far ahead of your opponent you finish. A loss scores 0. The CPU plays random legal moves, so a little planning gives you a real edge. Run your back checkers first, then bear off as fast as you can.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as RaceSettings),
  reducer,
  isTerminal, hint: (state: RaceState): HintTarget | null => (state.phase === "rolling" ? { selector: '[data-testid="hint-target-uckers-race-primary"]', pulses: 3 } : null),
  component: RaceGame,
};
