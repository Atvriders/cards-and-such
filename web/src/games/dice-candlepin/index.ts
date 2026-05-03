import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { DiceCandlepinState, DiceCandlepinAction, DiceCandlepinSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const DiceCandlepinGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.DiceCandlepinGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"Standard rules", default:true } } as const;
type S = SettingsOf<typeof settings>;

export const diceCandlepinPlugin: GamePlugin<DiceCandlepinState, DiceCandlepinAction, typeof settings> = {
  id: "dice-candlepin",
  title: "Dice Candlepin Bowling",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: 'Dice Candlepin Bowling: 2-die rolls = pins; classic strike/spare scoring across 10 frames.',
  howToPlay: 'Dice Candlepin Bowling is a real, dice-driven simulation. Dice Candlepin Bowling: 2-die rolls = pins; classic strike/spare scoring across 10 frames.\\n\\nPress Roll to take your turn. Each round resolves immediately and the running score updates after every roll. Press Next to advance until the match ends.\\n\\nGame state is fully seeded for replay parity, and the log strip shows your most recent rolls.',
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as DiceCandlepinSettings),
  reducer,
  isTerminal,
  hint: (state: DiceCandlepinState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "rolling") return { selector: '[data-testid="hint-target-dice-candlepin-roll"]', pulses: 3 };
    if (state.phase === "rolled") return { selector: '[data-testid="hint-target-dice-candlepin-next"]', pulses: 3 };
    return null;
  },
  component: DiceCandlepinGame,
};
