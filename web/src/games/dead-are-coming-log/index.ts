import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { DeadAreComingLogState, DeadAreComingLogAction, DeadAreComingLogSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const DeadAreComingLogGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.DeadAreComingLogGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const deadAreComingLogPlugin: GamePlugin<DeadAreComingLogState, DeadAreComingLogAction, typeof settings> = {
  id: "dead-are-coming-log",
  title: "The Dead Are Coming",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Solo journaling homage; community management in apocalypse.",
  howToPlay: "The Dead Are Coming is a solo journaling homage to Tim Hutchings' The Dead Are Coming, a post-apocalypse solo journaling game where you manage a small community of survivors as the dead close in. The original game uses oracle prompts, a deck of cards, and a slow accrual of risk.\n\nAcross ten community entries you decide who scavenges, who guards, who comforts the children, and who is asked to leave. Each entry offers four weighted choices (A-D); your pick assigns a base reward plus 0-20 of mulberry32 variance.\n\nThis solo digital homage compresses oracle draws into curated prompt-and-roll while preserving the leadership-under-loss tone of being responsible for people you cannot all save.\n\nKeep the log clean. Generations later, someone will read it and decide whether you were brave or only tired.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as DeadAreComingLogSettings),
  reducer, isTerminal, hint: (state: DeadAreComingLogState): HintTarget | null => (state.phase === "choose" ? { selector: '[data-testid="hint-target-dead-are-coming-log-primary"]', pulses: 3 } : null), component: DeadAreComingLogGame,
};
