import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { RajasCharmersState, RajasCharmersAction, RajasCharmersSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const RajasCharmersGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.RajasCharmersGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const rajasCharmersPlugin: GamePlugin<RajasCharmersState, RajasCharmersAction, typeof settings> = {
  id: "rajas-charmers",
  title: "Rajas of the Ganges: The Dice Charmers",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Roll-and-write Rajas with province building on shared board.",
  howToPlay: "Rajas of the Ganges: The Dice Charmers is the roll-and-write spin-off of Rajas of the Ganges. In this adaptation you build provinces on a 4x4 personal grid by rolling a single d6 each turn and assigning the value to a province cell. Click Roll, then click any empty cell to mark it with the rolled number. You may Skip if the roll doesn't fit. Each marked province scores its dice value as wealth. Strategy: complete rows and columns to build river-side trade routes (+5 each), plus +10 for fully developing your provinces. Rajas's classic charm theme rewards tempo — early high rolls build the foundation, late low rolls close out partial lines. After 12 rolls the maharaja's reign ends. A solid Charmers score is 34-48 points; an exceptional ruler reaches 65+. Each reign begins from a fresh seeded dice sequence.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as RajasCharmersSettings),
  reducer,
  isTerminal,
  hint: (state: any) => {
    if ((state as any).phase === "done") return null;
    if ((state as any).phase === "rolling") return { selector: '[data-testid="hint-target-rajas-charmers-roll"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-rajas-charmers-skip"]', pulses: 3 };
  },
  component: RajasCharmersGame,
};
