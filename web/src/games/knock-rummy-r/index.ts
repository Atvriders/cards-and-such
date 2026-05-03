import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { KnockRummyRState, KnockRummyRAction, KnockRummyRSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const KnockRummyRGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.KnockRummyRGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const knockRummyRPlugin: GamePlugin<KnockRummyRState, KnockRummyRAction, typeof settings> = {
  id: "knock-rummy-r", title: "Knock Rummy", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Gin-style rummy with low-deadwood knocking allowed at any time.",
  howToPlay: "Knock Rummy is a Gin-style rummy variant where you can knock at any time when your deadwood is reasonably low (typically under ten). In this short auto-version, the engine evaluates each round's hand and knocks if the deadwood threshold is met.\n\nEach round you are dealt seven cards. The engine auto-melds into sets (three or more of the same rank) and runs (three or more consecutive same-suit cards). Deadwood is summed: aces one, 2-10 face value, J/Q/K ten.\n\nSix rounds are played. If deadwood is zero (gin), you score forty points. If deadwood is one to ten (legal knock), you score twenty-five points. If deadwood is eleven to twenty, you score ten points. Twenty-one or more scores zero.\n\nExpected score is around fifty-five to seventy-five points across six rounds. A gin in seven cards is rare; legal knocks happen perhaps a third of the time. The variant rewards holding low cards and dropping high cards aggressively. A clean six-round sweep with a gin would push past 240.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as KnockRummyRSettings),
  reducer, isTerminal, 
  hint: (state: KnockRummyRState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (state.phase === "play") return { selector: '[data-testid="hint-target-knock-rummy-r-play"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-knock-rummy-r-next"]', pulses: 3 };
    return null;
  },
  component: KnockRummyRGame,
};
