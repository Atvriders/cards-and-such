import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { LaGranjaSiestaState, LaGranjaSiestaAction, LaGranjaSiestaSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const LaGranjaSiestaGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.LaGranjaSiestaGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const laGranjaSiestaPlugin: GamePlugin<LaGranjaSiestaState, LaGranjaSiestaAction, typeof settings> = {
  id: "la-granja-siesta",
  title: "La Granja: No Siesta",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Dice-drafting flip-and-write farmyard delivery scheduling.",
  howToPlay: "La Granja: No Siesta is a dice-drafting flip-and-write game about scheduling farmyard deliveries. In this adaptation you organise farm deliveries on a 4x4 grid by rolling a single d6 each turn and assigning the value to a delivery cell. Click Roll, then click any empty cell to mark it with the rolled number. You may Skip a roll if no slot fits. Each marked cell scores its dice value as delivery profit. Strategy: complete rows and columns to fulfil multi-cart contracts (+5 each), plus +10 for completing the full delivery board. La Granja's farmyard theme rewards careful scheduling; here line completion drives bonuses. Higher rolls deliver premium goods, lower rolls finish partial routes. After 12 rolls the harvest season ends. A solid Siesta score is 34-48 points; a master farmer reaches 65+. Seeded dice ensure each harvest is unique.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as LaGranjaSiestaSettings),
  reducer,
  isTerminal,
  hint: (state: any) => {
    if ((state as any).phase === "done") return null;
    if ((state as any).phase === "rolling") return { selector: '[data-testid="hint-target-la-granja-siesta-roll"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-la-granja-siesta-skip"]', pulses: 3 };
  },
  component: LaGranjaSiestaGame,
};
