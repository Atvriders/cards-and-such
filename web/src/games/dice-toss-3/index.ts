import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceToss3State, DiceToss3Action, DiceToss3Settings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const DiceToss3Game = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.DiceToss3Game as unknown as React.ComponentType<unknown> })));
const settings = { rounds: { kind:"enum" as const, label:"Rounds", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const diceToss3Plugin: GamePlugin<DiceToss3State, DiceToss3Action, typeof settings> = {
  id: "dice-toss-3", title: "Dice Toss 3", category: "dice",
  players: { min:1, max:1, multiplayer:false },
  description: "Toss three dice each round and score their combined total.",
  howToPlay: `Dice Toss 3 is a simple dice accumulation game. Each round you toss three six-sided dice and score their combined total — so rolls can range from 3 to 18 points per round.

There are no decisions to make: just toss and watch the dice fly. The highest possible score per round is 18 (three sixes). Over 10 or 20 rounds you build a total score.

Average rounds score around 10-11 points, so a great run with lots of high numbers will push your score well above average. Can you roll your way to a perfect game?`,
  settings,
  initialState: (seed:number, s:S) => initialState(seed, s as DiceToss3Settings),
  reducer, isTerminal,
    hint: (state: DiceToss3State) => {
      if (state.phase === "gameover") return null;
      if (state.phase === "result") return { selector: '[data-testid="hint-target-dice-toss-3-next"]', pulses: 3 };
      return { selector: '[data-testid="hint-target-dice-toss-3-action"]', pulses: 3 };
    },
  component: DiceToss3Game,
};
