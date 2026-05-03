import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TinCanTossState, TinCanTossAction, TinCanTossSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const TinCanTossGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.TinCanTossGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const tinCanTossPlugin: GamePlugin<TinCanTossState, TinCanTossAction, typeof settings> = {
  id: "tin-can-toss", title: "Tin Can Toss", category: "arcade",
  players: { min:1, max:1, multiplayer:false },
  description: "Knock tin cans off the shelf with the perfect throwing force!",
  howToPlay: `Tin Can Toss is a carnival-style throwing game. Each round, a stack of tin cans sits on a shelf. Your job is to throw a ball with exactly the right force to knock them cleanly off.\n\nToo weak and the cans stay put; too strong and the ball bounces oddly. Find the sweet force for each round using the Force slider.\n\nPoints depend on how close your force is to the hidden target. The target shifts each round. 10 throws per game — aim for the perfect sweep every time!`,
  settings,
  initialState: (seed:number, s:S) => initialState(seed, s as TinCanTossSettings),
  reducer, isTerminal,
    hint: (state: TinCanTossState) => {
      if (state.phase === "done") return null;
      return { selector: '[data-testid="hint-target-tin-can-toss-action"]', pulses: 3 };
    },
  component: TinCanTossGame,
};
