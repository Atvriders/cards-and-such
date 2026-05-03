import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { MythicEmulatorOracleState, MythicEmulatorOracleAction, MythicEmulatorOracleSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const MythicEmulatorOracleGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.MythicEmulatorOracleGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const mythicEmulatorOraclePlugin: GamePlugin<MythicEmulatorOracleState, MythicEmulatorOracleAction, typeof settings> = {
  id: "mythic-emulator-oracle",
  title: "Mythic Emulator: Oracle",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Solo journaling homage; chaos-factor yes/no oracle prompts.",
  howToPlay: "Mythic Emulator: Oracle is a solo journaling homage to Tana Pigeon's Mythic Game Master Emulator, where probability-based yes/no oracle questions drive scene-by-scene narrative under a chaos factor that tilts toward the unexpected.\n\nAcross ten oracle queries you ask a question and pick one of four interpretations of the result. Each prompt offers four weighted choices (A-D); your pick assigns a base reward plus 0-20 of mulberry32 variance. The point is not to predict the future but to discover what your character would do once each answer arrived.\n\nThe original Mythic uses 2d10 fate checks, event tables, and a chaos meter. This solo digital homage compresses those rolls into prompt-and-roll while preserving the question-driven, scene-emergent tone of running a game with no other GM.\n\nThe oracle does not lie. But the oracle is fond of detours.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as MythicEmulatorOracleSettings),
  reducer, isTerminal, hint: (state: MythicEmulatorOracleState): HintTarget | null => (state.phase === "choose" ? { selector: '[data-testid="hint-target-mythic-emulator-oracle-primary"]', pulses: 3 } : null), component: MythicEmulatorOracleGame,
};
