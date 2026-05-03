import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { IndianRState, IndianRAction, IndianRSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const IndianRGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.IndianRGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const indianRPlugin: GamePlugin<IndianRState, IndianRAction, typeof settings> = {
  id: "indian-r", title: "Indian Rummy", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "13-card rummy — meld pure sequence plus other valid sequences/sets.",
  howToPlay: "Indian Rummy is a thirteen-card rummy variant requiring at least one pure sequence (a run of three or more same-suit cards without any wild cards). A second sequence may use a joker as a wild substitute. Beyond that, you can finish your hand with sets and runs.\n\nEach round you are dealt nine cards (a shorter version of the full thirteen). The engine auto-melds your hand into sets and runs. It then checks whether you have at least one pure run; this is the key rule.\n\nSix rounds are played. With a pure sequence, you score twenty-five points plus five per additional meld. Without a pure sequence, you score five consolation points per partial meld (sets or runs of two). Picking up a full hand (three or more melds with a pure sequence) earns a twenty-five-point bonus.\n\nExpected score is around fifty to seventy points across six rounds. Pure sequences appear roughly thirty per cent of the time in a nine-card hand; a clean six-round run with a pure sequence in each would push past 200.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as IndianRSettings),
  reducer, isTerminal, 
  hint: (state: IndianRState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (state.phase === "play") return { selector: '[data-testid="hint-target-indian-r-play"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-indian-r-next"]', pulses: 3 };
    return null;
  },
  component: IndianRGame,
};
