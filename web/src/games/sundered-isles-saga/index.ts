import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { SunderedIslesSagaState, SunderedIslesSagaAction, SunderedIslesSagaSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const SunderedIslesSagaGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.SunderedIslesSagaGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const sunderedIslesSagaPlugin: GamePlugin<SunderedIslesSagaState, SunderedIslesSagaAction, typeof settings> = {
  id: "sundered-isles-saga",
  title: "Sundered Isles Saga",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Solo naval-exploration journaling homage; pirate empires.",
  howToPlay: "Sundered Isles Saga is a solo journaling homage to Shawn Tomkin's Ironsworn: Sundered Isles, a naval-exploration ruleset that swaps the deep dark of Starforged for warm coral seas and pirate empires.\n\nAcross ten saga entries you captain a vessel through scattered isles, contesting flags, securing safe coves, and recording the songs your crew sing. Each entry offers four weighted choices (A-D); the chosen letter assigns a base reward plus 0-20 of mulberry32 variance.\n\nThe original Sundered Isles uses oracle moves, ship assets, and faction tides. This solo digital homage replaces the move-trigger mechanic with weighted choice-and-roll, while preserving the open-water exploration tone of finding islands no map has named.\n\nA captain is judged by what they leave behind — wreckage or wake. Steer your saga and discover which.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SunderedIslesSagaSettings),
  reducer, isTerminal, hint: (state: SunderedIslesSagaState): HintTarget | null => (state.phase === "choose" ? { selector: '[data-testid="hint-target-sundered-isles-saga-primary"]', pulses: 3 } : null), component: SunderedIslesSagaGame,
};
