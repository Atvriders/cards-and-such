import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { DiceMolkkyState, DiceMolkkyAction, DiceMolkkySettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const DiceMolkkyGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.DiceMolkkyGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"Standard rules", default:true } } as const;
type S = SettingsOf<typeof settings>;

export const diceMolkkyPlugin: GamePlugin<DiceMolkkyState, DiceMolkkyAction, typeof settings> = {
  id: "dice-molkky",
  title: "Dice Mölkky",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: 'Mölkky: knock numbered pins to score; reach exactly 50.',
  howToPlay: 'Dice Mölkky is a real, dice-driven simulation. Mölkky: knock numbered pins to score; reach exactly 50.\\n\\nPress Roll to take your turn. Each round resolves immediately and the running score updates after every roll. Press Next to advance until the match ends.\\n\\nGame state is fully seeded for replay parity, and the log strip shows your most recent rolls.',
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as DiceMolkkySettings),
  reducer,
  isTerminal,
  hint: (state: DiceMolkkyState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "rolling") return { selector: '[data-testid="hint-target-dice-molkky-roll"]', pulses: 3 };
    if (state.phase === "rolled") return { selector: '[data-testid="hint-target-dice-molkky-next"]', pulses: 3 };
    return null;
  },
  component: DiceMolkkyGame,
};
