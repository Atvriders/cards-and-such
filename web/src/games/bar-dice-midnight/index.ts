import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { BarDiceMidnightState, BarDiceMidnightAction, BarDiceMidnightSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const BarDiceMidnightGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.BarDiceMidnightGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"Standard rules", default:true } } as const;
type S = SettingsOf<typeof settings>;

export const midnightBarDicePlugin: GamePlugin<BarDiceMidnightState, BarDiceMidnightAction, typeof settings> = {
  id: "bar-dice-midnight",
  title: "Midnight Bar Dice",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: 'Midnight: roll 6 dice; lock at least one each turn; keep a 1 and a 4; high counts wins.',
  howToPlay: 'Midnight Bar Dice is a real, dice-driven simulation. Midnight: roll 6 dice; lock at least one each turn; keep a 1 and a 4; high counts wins.\\n\\nPress Roll to take your turn. Each round resolves immediately and the running score updates after every roll. Press Next to advance until the match ends.\\n\\nGame state is fully seeded for replay parity, and the log strip shows your most recent rolls.',
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as BarDiceMidnightSettings),
  reducer,
  isTerminal,
  hint: (state: BarDiceMidnightState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "rolling") return { selector: '[data-testid="hint-target-bar-dice-midnight-roll"]', pulses: 3 };
    if (state.phase === "rolled") return { selector: '[data-testid="hint-target-bar-dice-midnight-next"]', pulses: 3 };
    return null;
  },
  component: BarDiceMidnightGame,
};
