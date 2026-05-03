import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { Rummy500ClassicRState, Rummy500ClassicRAction, Rummy500ClassicRSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const Rummy500ClassicRGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.Rummy500ClassicRGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const rummy500ClassicRPlugin: GamePlugin<Rummy500ClassicRState, Rummy500ClassicRAction, typeof settings> = {
  id: "rummy-500-classic-r", title: "Rummy 500 Classic", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Capture-style 500 Rum scoring across eight hands.",
  howToPlay: "Rummy 500, also called 500 Rum, is a capture-scoring rummy played to a target of 500 total points, where players score for melded cards and lose for cards left in hand. The hallmark is the deep discard pile from which any card may be drawn.\n\nIn this single-player drill, eight rounds are played and the engine auto-melds your eight-card hand. Sets of three or more matching ranks and runs of three or more consecutive same-suit cards both count. Aces count one (low) for sequences and value, pip cards face value, faces ten.\n\nA matched meld pays eighteen base plus six per extra card. No melds produces a small deadwood consolation. Going out adds thirty.\n\nExpected score across eight rounds is seventy to one hundred ten. The deeper hand size of eight gives you more room to construct melds; expect at least one round with three melds and one round with no usable cards. Pace yourself for steady accumulation rather than chasing a single perfect out.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as Rummy500ClassicRSettings),
  reducer, isTerminal, 
  hint: (state: Rummy500ClassicRState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (state.phase === "play") return { selector: '[data-testid="hint-target-rummy-500-classic-r-play"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-rummy-500-classic-r-next"]', pulses: 3 };
    return null;
  },
  component: Rummy500ClassicRGame,
};
