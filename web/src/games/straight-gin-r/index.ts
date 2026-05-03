import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { StraightGinRState, StraightGinRAction, StraightGinRSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const StraightGinRGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.StraightGinRGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const straightGinRPlugin: GamePlugin<StraightGinRState, StraightGinRAction, typeof settings> = {
  id: "straight-gin-r", title: "Straight Gin", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Gin Rummy variant — only gin (zero deadwood) ends the hand.",
  howToPlay: "Straight Gin is a strict version of Gin Rummy where the only way to end a hand is to gin — meld all your cards into legal sets and runs with zero deadwood. There is no knocking allowed.\n\nEach round you are dealt seven cards. The engine auto-melds your hand, finding sets (three or more of the same rank) and runs (three or more consecutive same-suit cards). The remaining cards are deadwood.\n\nSix rounds are played. If your hand fully melds (zero deadwood), you score forty points plus a five-point gin bonus per round. If you have any deadwood, you score nothing for that round (no knocks allowed). To soften the slow grind, partial sets of two earn a small one-point consolation.\n\nExpected score across six rounds is twenty to forty points; a gin in any round is rare with only seven cards but spectacular when it lands. Most rounds you will simply fail to gin and pick up the consolation. A run that gins twice would be excellent — the variant punishes lukewarm hands far more than standard Gin Rummy.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as StraightGinRSettings),
  reducer, isTerminal, 
  hint: (state: StraightGinRState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (state.phase === "play") return { selector: '[data-testid="hint-target-straight-gin-r-play"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-straight-gin-r-next"]', pulses: 3 };
    return null;
  },
  component: StraightGinRGame,
};
