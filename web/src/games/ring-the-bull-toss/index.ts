import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { RingTheBullTossState, RingTheBullTossAction, RingTheBullTossSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const RingTheBullTossGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.RingTheBullTossGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"Standard rules", default:true } } as const;
type S = SettingsOf<typeof settings>;

export const ringTheBullPlugin: GamePlugin<RingTheBullTossState, RingTheBullTossAction, typeof settings> = {
  id: "ring-the-bull-toss",
  title: "Ring the Bull",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: 'Ring the Bull: throw to score; bag/ring on board = points; race to 25.',
  howToPlay: 'Ring the Bull is a real, dice-driven simulation. Ring the Bull: throw to score; bag/ring on board = points; race to 25.\\n\\nPress Roll to take your turn. Each round resolves immediately and the running score updates after every roll. Press Next to advance until the match ends.\\n\\nGame state is fully seeded for replay parity, and the log strip shows your most recent rolls.',
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as RingTheBullTossSettings),
  reducer,
  isTerminal,
    hint: (state: RingTheBullTossState) => {
      if (state.phase === "done") return null;
      return { selector: '[data-testid="hint-target-ring-the-bull-toss-action"]', pulses: 3 };
    },
  component: RingTheBullTossGame,
};
