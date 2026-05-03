import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { HollywoodGinRState, HollywoodGinRAction, HollywoodGinRSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const HollywoodGinRGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.HollywoodGinRGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const hollywoodGinRPlugin: GamePlugin<HollywoodGinRState, HollywoodGinRAction, typeof settings> = {
  id: "hollywood-gin-r", title: "Hollywood Gin", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Three-game simultaneous Gin scoring across nine rounds.",
  howToPlay: "Hollywood Gin is a Gin Rummy variant in which three games are scored simultaneously, with each subsequent game beginning when a player wins the previous one. The mechanic encourages aggressive play across overlapping scorelines.\n\nIn this single-player adaptation, the engine runs a unified nine-round drill. Each round you are dealt seven cards and the engine auto-melds them into sets (three or more of a rank) and runs (three or more of consecutive same-suit cards). Deadwood is the sum of unmelded card values: aces count one, 2-10 face value, J/Q/K count ten.\n\nYou earn eighteen points per meld, plus six points per extra card in the meld. With no melds you collect a small consolation tied to your deadwood. Going out (zero deadwood) earns a thirty-point bonus.\n\nExpected score is around eighty to one hundred twenty across nine rounds. Hollywood pacing rewards consistent meld production over occasional gins. Plan to lock in two melds per hand on average; that puts you on track for the higher end of the band.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as HollywoodGinRSettings),
  reducer, isTerminal, 
  hint: (state: HollywoodGinRState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (state.phase === "play") return { selector: '[data-testid="hint-target-hollywood-gin-r-play"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-hollywood-gin-r-next"]', pulses: 3 };
    return null;
  },
  component: HollywoodGinRGame,
};
