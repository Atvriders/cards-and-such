import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { KalukiRState, KalukiRAction, KalukiRSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const KalukiRGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.KalukiRGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const kalukiRPlugin: GamePlugin<KalukiRState, KalukiRAction, typeof settings> = {
  id: "kaluki-r", title: "Kaluki", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Caribbean rummy with bonus jokers and high-value first meld.",
  howToPlay: "Kaluki, also spelled Kalookie, is a British and Caribbean rummy variant played with one or two decks plus jokers. In this short version, you are dealt seven cards. The first meld must total at least forty points, including face values: aces eleven, 2-10 face, J/Q/K count ten.\n\nThe engine auto-melds your hand into sets (three or more of the same rank) and runs (three or more consecutive same-suit cards). Jokers, represented by special wild slots, can substitute for any card in a meld and are worth fifteen points when laid down.\n\nSix rounds are played. If your first meld totals forty or more, you score thirty points plus five per extra meld. If under forty, you score five points consolation only. A round that fully melds your hand earns a fifty-point bonus.\n\nExpected score is around fifty-five to seventy points across six rounds. Jokers and high-rank sets help cross the forty-point threshold; mid-rank runs alone often fall short.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as KalukiRSettings),
  reducer, isTerminal, 
  hint: (state: KalukiRState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (state.phase === "play") return { selector: '[data-testid="hint-target-kaluki-r-play"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-kaluki-r-next"]', pulses: 3 };
    return null;
  },
  component: KalukiRGame,
};
