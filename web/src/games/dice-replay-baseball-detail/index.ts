import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { DiceReplayBaseballDetailState, DiceReplayBaseballDetailAction, DiceReplayBaseballDetailSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const DiceReplayBaseballDetailGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.DiceReplayBaseballDetailGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"Standard rules", default:true } } as const;
type S = SettingsOf<typeof settings>;

export const diceReplayBaseballDetailPlugin: GamePlugin<DiceReplayBaseballDetailState, DiceReplayBaseballDetailAction, typeof settings> = {
  id: "dice-replay-baseball-detail",
  title: "Replay Baseball Detail",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: 'Replay Baseball Detail: play 9 innings of dice-driven at-bats. Outscore the CPU.',
  howToPlay: 'Replay Baseball Detail is a real, dice-driven simulation. Replay Baseball Detail: play 9 innings of dice-driven at-bats. Outscore the CPU.\\n\\nPress Roll to take your turn. Each round resolves immediately and the running score updates after every roll. Press Next to advance until the match ends.\\n\\nGame state is fully seeded for replay parity, and the log strip shows your most recent rolls.',
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as DiceReplayBaseballDetailSettings),
  reducer,
  isTerminal,
  hint: (state: DiceReplayBaseballDetailState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "rolling") return { selector: '[data-testid="hint-target-dice-replay-baseball-detail-roll"]', pulses: 3 };
    if (state.phase === "rolled") return { selector: '[data-testid="hint-target-dice-replay-baseball-detail-next"]', pulses: 3 };
    return null;
  },
  component: DiceReplayBaseballDetailGame,
};
