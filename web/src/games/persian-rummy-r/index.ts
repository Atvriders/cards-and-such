import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PersianRummyRState, PersianRummyRAction, PersianRummyRSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const PersianRummyRGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.PersianRummyRGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const persianRummyRPlugin: GamePlugin<PersianRummyRState, PersianRummyRAction, typeof settings> = {
  id: "persian-rummy-r", title: "Persian Rummy", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Rummy with bonus payouts for quartets and aces.",
  howToPlay: "Persian Rummy is a partnership rummy variant best known for its quartet bonuses: four-of-a-kind sets pay extra, with ace quartets paying the most. Jokers are sometimes used as wilds. In this single-player drill the engine recognises the rank-set bonus pattern.\n\nEach round you draw seven cards. The engine auto-melds your hand into sets and runs and reports deadwood. Aces count one, pip cards face value, faces count ten. Sets of size four are common bonus targets — keep two of a rank rather than one, and look for matching triples to upgrade to quartets.\n\nA matched meld pays eighteen base plus six per extra card, so a four-of-a-kind nets twenty-four. With no melds you receive a small deadwood-tied consolation. Going out scores thirty bonus.\n\nExpected score across eight rounds is seventy to one hundred ten. Quartets are the headline play; aim for at least one across the eight-round game. Discipline beats hero hands here — a lean pair of triples will outpace a single four with deadwood.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as PersianRummyRSettings),
  reducer, isTerminal, 
  hint: (state: PersianRummyRState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (state.phase === "play") return { selector: '[data-testid="hint-target-persian-rummy-r-play"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-persian-rummy-r-next"]', pulses: 3 };
    return null;
  },
  component: PersianRummyRGame,
};
