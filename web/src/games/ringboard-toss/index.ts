import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { RingboardTossState, RingboardTossAction, RingboardTossSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const RingboardTossGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.RingboardTossGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"Standard rules", default:true } } as const;
type S = SettingsOf<typeof settings>;

export const ringboardTossPlugin: GamePlugin<RingboardTossState, RingboardTossAction, typeof settings> = {
  id: "ringboard-toss",
  title: "Ringboard Toss",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: 'Ringboard Toss: throw to score; bag/ring on board = points; race to 50.',
  howToPlay: 'Ringboard Toss is a real, dice-driven simulation. Ringboard Toss: throw to score; bag/ring on board = points; race to 50.\\n\\nPress Roll to take your turn. Each round resolves immediately and the running score updates after every roll. Press Next to advance until the match ends.\\n\\nGame state is fully seeded for replay parity, and the log strip shows your most recent rolls.',
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as RingboardTossSettings),
  reducer,
  isTerminal,
    hint: (state: RingboardTossState) => {
      if (state.phase === "done") return null;
      return { selector: '[data-testid="hint-target-ringboard-toss-action"]', pulses: 3 };
    },
  component: RingboardTossGame,
};
