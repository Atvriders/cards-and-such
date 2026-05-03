import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { WheresWaldoCardState, WheresWaldoCardAction, WheresWaldoCardSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const WheresWaldoCardGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.WheresWaldoCardGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const wheresWaldoCardPlugin: GamePlugin<WheresWaldoCardState, WheresWaldoCardAction, typeof settings> = {
  id: "wheres-waldo-card", title: "Where's Waldo Card", category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Spot Waldo hidden among decoys.",
  howToPlay: "Where's Waldo Card is a digital adaptation of finding hidden Waldo among lookalikes. Each of fifteen rounds shows you four face-style panels — exactly one is Waldo (the named target). The other three are decoy faces (smiles, winks, neutral, etc.) chosen to be visually similar at a glance. Tap the Waldo, hit Submit, score ten points if correct. Fifteen rounds, max score 150. The decoy pool draws from fourteen face descriptions to keep rounds varied. Where's Waldo Card emphasizes rapid visual scanning and discrimination — exactly what the original picture-book series trained. Children love it for the friendly competition of finding the target; adults appreciate the no-frills speed drill. Hit Submit to lock and Next to advance. Average runs net 110-140; perfect scores happen often once you are locked in to spotting the target. Total time about two minutes for fifteen rounds played end-to-end smoothly.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as WheresWaldoCardSettings),
  reducer, isTerminal, hint: (state: WheresWaldoCardState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-wheres-waldo-card-answer-0"]', pulses: 3 } : null, component: WheresWaldoCardGame,
};
