import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { BarDiceThreesState, BarDiceThreesAction, BarDiceThreesSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const BarDiceThreesGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.BarDiceThreesGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"Standard rules", default:true } } as const;
type S = SettingsOf<typeof settings>;

export const threesBarDicePlugin: GamePlugin<BarDiceThreesState, BarDiceThreesAction, typeof settings> = {
  id: "bar-dice-threes",
  title: "Threes Bar Dice",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: 'Threes: 3s count zero; lowest total after 5 rolls wins.',
  howToPlay: 'Threes Bar Dice is a real, dice-driven simulation. Threes: 3s count zero; lowest total after 5 rolls wins.\\n\\nPress Roll to take your turn. Each round resolves immediately and the running score updates after every roll. Press Next to advance until the match ends.\\n\\nGame state is fully seeded for replay parity, and the log strip shows your most recent rolls.',
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as BarDiceThreesSettings),
  reducer,
  isTerminal,
  hint: (state: BarDiceThreesState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (state.phase === "rolling") {
      return { selector: '[data-testid="hint-target-bar-dice-threes-roll"]', pulses: 3 };
    }
    return { selector: '[data-testid="hint-target-bar-dice-threes-next"]', pulses: 3 };
  },
  component: BarDiceThreesGame,
};
