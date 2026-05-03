import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { DiceBicycleVelodromeState, DiceBicycleVelodromeAction, DiceBicycleVelodromeSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const DiceBicycleVelodromeGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.DiceBicycleVelodromeGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"Standard rules", default:true } } as const;
type S = SettingsOf<typeof settings>;

export const diceBicycleVelodromePlugin: GamePlugin<DiceBicycleVelodromeState, DiceBicycleVelodromeAction, typeof settings> = {
  id: "dice-bicycle-velodrome",
  title: "Dice Velodrome",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: 'Dice Velodrome: race 16 squares against 3 CPUs; first across the line wins.',
  howToPlay: 'Dice Velodrome is a real, dice-driven simulation. Dice Velodrome: race 16 squares against 3 CPUs; first across the line wins.\\n\\nPress Roll to take your turn. Each round resolves immediately and the running score updates after every roll. Press Next to advance until the match ends.\\n\\nGame state is fully seeded for replay parity, and the log strip shows your most recent rolls.',
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as DiceBicycleVelodromeSettings),
  reducer,
  isTerminal,
  hint: (state: DiceBicycleVelodromeState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "rolling") return { selector: '[data-testid="hint-target-dice-bicycle-velodrome-roll"]', pulses: 3 };
    if (state.phase === "rolled") return { selector: '[data-testid="hint-target-dice-bicycle-velodrome-next"]', pulses: 3 };
    return null;
  },
  component: DiceBicycleVelodromeGame,
};
