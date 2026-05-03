import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { RoundCornerGinRState, RoundCornerGinRAction, RoundCornerGinRSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const RoundCornerGinRGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.RoundCornerGinRGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const roundCornerGinRPlugin: GamePlugin<RoundCornerGinRState, RoundCornerGinRAction, typeof settings> = {
  id: "round-corner-gin-r", title: "Round-the-Corner Gin", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Gin variant allowing wraparound A-K-Q-J-10 sequences.",
  howToPlay: "Round-the-Corner Gin is a Gin Rummy variant in which the ace is both low and high, allowing runs to wrap around past the king (Q-K-A-2-3 is a legal sequence). The wraparound rule increases the meld density of every hand.\n\nIn this single-player drill, each round you receive seven cards. The engine auto-melds your hand identifying both rank-sets and same-suit sequences, then computes deadwood. Aces count one, pip cards face value, faces count ten. Wraparound runs are recognised when present.\n\nMelds pay eighteen base plus six per extra card. With zero melds you collect a tiny consolation. A clean out (zero deadwood) earns thirty bonus points and ends the round on a high.\n\nExpected score across seven rounds is sixty to one hundred. Aces are doubly useful here because they extend low runs and high runs both, so favour drawing toward sequences that include them. Two consistent melds per hand keep you in the upper band.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as RoundCornerGinRSettings),
  reducer, isTerminal, 
  hint: (state: RoundCornerGinRState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (state.phase === "play") return { selector: '[data-testid="hint-target-round-corner-gin-r-play"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-round-corner-gin-r-next"]', pulses: 3 };
    return null;
  },
  component: RoundCornerGinRGame,
};
