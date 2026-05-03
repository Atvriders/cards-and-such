import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { ArtefactHistoryState, ArtefactHistoryAction, ArtefactHistorySettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const ArtefactHistoryGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.ArtefactHistoryGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const artefactHistoryPlugin: GamePlugin<ArtefactHistoryState, ArtefactHistoryAction, typeof settings> = {
  id: "artefact-history",
  title: "Artefact: History",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Solo journaling; magical object lives across many owners.",
  howToPlay: "Artefact: History is a solo journaling homage to Jack Harrison's Artefact, a game in which you write the history of a single magical object passing through many owners across many centuries.\n\nAcross ten ownership entries you record the artefact's mood, its actions, the regret of its bearer, and the silence after its loss. Each entry offers four weighted choices (A-D); your pick assigns a base reward plus 0-20 of mulberry32 variance. Choose what the object endures, what it remembers, and what it makes its bearer pay.\n\nThe original Artefact uses prompt cards, a journal, and slow time. This solo digital homage compresses the season-long write into a single sitting while preserving the deep-time, multi-life tone of being older than the languages spoken about you.\n\nObjects do not forget. Bearers do.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ArtefactHistorySettings),
  reducer, isTerminal, hint: (state: ArtefactHistoryState): HintTarget | null => (state.phase === "choose" ? { selector: '[data-testid="hint-target-artefact-history-primary"]', pulses: 3 } : null), component: ArtefactHistoryGame,
};
