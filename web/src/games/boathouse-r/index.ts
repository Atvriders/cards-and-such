import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BoathouseRState, BoathouseRAction, BoathouseRSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const BoathouseRGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.BoathouseRGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const boathouseRPlugin: GamePlugin<BoathouseRState, BoathouseRAction, typeof settings> = {
  id: "boathouse-r", title: "Boathouse Rum", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Rummy variant with discard-pile sharing and aces high or low.",
  howToPlay: "Boathouse Rum is a rummy variant where aces can count either high or low for runs and the discard pile may be drawn freely (with extra cards taken). It is named after a college boathouse in 1900s America. In this short version you play six rounds against the deck.\n\nEach round you are dealt seven cards. The engine auto-melds your hand into sets (three or more same rank) and runs (three or more consecutive same-suit cards), with aces flexible to bridge K-A-2 or A-2-3 wraparound runs.\n\nSix rounds are played. Each full meld scores twenty points plus five per extra card. A wraparound run (using ace as both high and low) scores a bonus ten. Deadwood costs one point per card.\n\nExpected score is around fifty-five to eighty points across six rounds. Wraparound runs are rare but worth chasing; aces in a hand always increase the meld possibilities. A clean run with two wraparound runs can push past 130. The CPU is not involved — it's just you, the deck, and the auto-meld engine.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as BoathouseRSettings),
  reducer, isTerminal, 
  hint: (state: BoathouseRState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (state.phase === "play") return { selector: '[data-testid="hint-target-boathouse-r-play"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-boathouse-r-next"]', pulses: 3 };
    return null;
  },
  component: BoathouseRGame,
};
