import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { CityOfHorrorRwState, CityOfHorrorRwAction, CityOfHorrorRwSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const CityOfHorrorRwGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.CityOfHorrorRwGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const cityOfHorrorRwPlugin: GamePlugin<CityOfHorrorRwState, CityOfHorrorRwAction, typeof settings> = {
  id: "city-of-horror-rw",
  title: "City of Horror: R&W",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Roll-and-write survival; balance resource and survivor scores.",
  howToPlay: "City of Horror: R&W is a survival roll-and-write where dice drive your shelter management across 16 supply cells in a zombie-besieged city.\n\nEach round, click Roll to generate a die value (1-6) representing scavenged supplies. Click any empty supply cell to deposit that haul. Higher pips are scarcer survival goods — food, ammo, water. Click Skip if a roll won't fit your shelter strategy.\n\nScoring:\n- Each supply cell scores its pip (1-6).\n- +5 per row complete (food/water/ammo/medicine cache stocked).\n- +5 per column complete (survivor team equipped).\n- +10 for full shelter (you survive the apocalypse).\n\n12 rolls available. Balance is key: don't let zombies overrun a row by stockpiling only one column, and don't isolate high pips with skipped rounds. A solid survival run scores 35-55 points; full shelter completion reaches 65+. Each die is a desperate scavenge run — time them well. City of Horror in writing form: tense, strategic, and brutal.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as CityOfHorrorRwSettings),
  reducer,
  isTerminal,
  hint: (state: any) => {
    if ((state as any).phase === "done") return null;
    if ((state as any).phase === "rolling") return { selector: '[data-testid="hint-target-city-of-horror-rw-roll"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-city-of-horror-rw-skip"]', pulses: 3 };
  },
  component: CityOfHorrorRwGame,
};
