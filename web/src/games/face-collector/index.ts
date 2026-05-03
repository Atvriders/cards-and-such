import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { FaceCollectorState, FaceCollectorAction, FaceCollectorSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const FaceCollectorGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.FaceCollectorGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const faceCollectorPlugin: GamePlugin<FaceCollectorState, FaceCollectorAction, typeof settings> = {
  id:"face-collector", title:"Face Collector", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Each round, collect cards of a target face (J/Q/K/A). 4 rounds × 8 draws.",
  howToPlay:`Face Collector is a 4-round face-card matching game. Each round, your target is one specific face card: Jack, Queen, King, or Ace. Draw 8 random cards from a fresh deck for that round, and every match for the target face scores +10 points. Cards from any suit count — you're matching face only.

After 8 draws, the round ends and the next target face is randomly assigned. There are 4 rounds total. Each face appears with probability 4/52 = ~7.7% per draw, so matches are rare and satisfying — a little luck and you'll see a few hits per round.

Maximum score is 320 (8 hits × 4 rounds × 10 pts). Realistic averages cluster around 25-35 — the rarity of face cards keeps the high score honest. Streaks are uncommon but unforgettable.

Tap Draw to flip the next card. Watch the deck spit out random cards and cheer when your target lands!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as FaceCollectorSettings),
  reducer, isTerminal, hint: (state: FaceCollectorState): HintTarget | null => (state.phase !== "done" ? { selector: ".col-btn", pulses: 3 } : null), component:FaceCollectorGame,
};
