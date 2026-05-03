import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { HelanGarState, HelanGarAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const HelanGar = /* @__PURE__ */ lazy(() => import("./HelanGar.js").then((mod) => ({ default: mod.HelanGar as unknown as React.ComponentType<unknown> })));
const helanGarSettings = {
  stages: {
    kind: "enum" as const,
    label: "Stages",
    options: ["3", "6"] as const,
    default: "6" as const,
  },
} as const;

type HelanGarSettingsType = SettingsOf<typeof helanGarSettings>;

export const helanGarPlugin: GamePlugin<HelanGarState, HelanGarAction, typeof helanGarSettings> = {
  id: "helan-gar",
  title: "Helan går",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Swedish dice game: roll two dice to match each stage's target sum through all 6 rounds.",
  howToPlay: `Helan går (the whole one goes) is a beloved Swedish social dice game traditionally played with drinks. In this digital version, it's a scoring challenge across 6 stages named Helan, Halvan, Tersen, Kvarten, Femman, and Sexan.

Each stage has a target sum you must roll with two dice: Helan needs a sum of 3, Halvan needs 4, Tersen 5, Kvarten 6, Femman 7, and Sexan 8. You have up to 3 rolls per stage to hit the target.

If you roll the target sum on any of your three attempts, you score points equal to the stage number (Helan = 1 pt, Sexan = 6 pts). If you fail all three rolls, you lose 1 point as a penalty.

After each stage result is shown, click the button to advance to the next stage. Your score accumulates — aim for a perfect run by hitting every target first try for a maximum of 21 points (1+2+3+4+5+6).

Play all 6 stages (Helan through Sexan) for the full experience, or try the quick 3-stage version for a shorter game.`,
  settings: helanGarSettings,
  initialState: (seed: number, settings: HelanGarSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state) => {
    const phase = (state as any).phase;
    if (phase === "rolling") return { selector: '[data-testid="hint-target-helan-gar-roll"]', pulses: 3 };
    if (phase === "rolling-dice") return { selector: '[data-testid="hint-target-helan-gar-roll"]', pulses: 3 };
    if (phase === "preRoll") return { selector: '[data-testid="hint-target-helan-gar-roll"]', pulses: 3 };
    if (phase === "ready") return { selector: '[data-testid="hint-target-helan-gar-roll"]', pulses: 3 };
    if (phase === "playerRoll") return { selector: '[data-testid="hint-target-helan-gar-roll"]', pulses: 3 };
    if (phase === "roll") return { selector: '[data-testid="hint-target-helan-gar-roll"]', pulses: 3 };
    if (phase === "play") return { selector: '[data-testid="hint-target-helan-gar-roll"]', pulses: 3 };
    if (phase === "playing") return { selector: '[data-testid="hint-target-helan-gar-roll"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-helan-gar-roll"]', pulses: 3 };
  },
  component: HelanGar,
};
