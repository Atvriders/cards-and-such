import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ScalaFortyRState, ScalaFortyRAction, ScalaFortyRSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const ScalaFortyRGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.ScalaFortyRGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const scalaFortyRPlugin: GamePlugin<ScalaFortyRState, ScalaFortyRAction, typeof settings> = {
  id: "scala-forty-r", title: "Scala 40", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Italian rummy — your first lay-down must total 40 points.",
  howToPlay: "Scala 40 is the Italian rummy classic where the entry barrier is high: your first lay-down must total at least forty points across all melds shown. After that first meld is laid, follow-up melds and additions to existing melds are unrestricted.\n\nEach round you are dealt seven cards. The engine auto-melds your hand into sets (three or more of the same rank) and runs (three or more consecutive same-suit cards), then sums the value: aces eleven, 2-10 face, J/Q/K ten.\n\nSix rounds are played. If your initial meld totals at least forty, you score thirty points plus ten per extra meld. If under forty, you score zero (the meld is locked away for that round). Going out completely (no deadwood) earns a fifty-point bonus.\n\nExpected score is around fifty-five to ninety points across six rounds. The forty-point threshold is the brutal bouncer at the door — most lukewarm hands fail to cross it. High-rank sets and long runs cross most reliably. A two-run hand of jacks-queens-kings same suit easily clears.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ScalaFortyRSettings),
  reducer, isTerminal, 
  hint: (state: ScalaFortyRState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (state.phase === "play") return { selector: '[data-testid="hint-target-scala-forty-r-play"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-scala-forty-r-next"]', pulses: 3 };
    return null;
  },
  component: ScalaFortyRGame,
};
