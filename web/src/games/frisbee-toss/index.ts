import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { FrisbeeTossState, FrisbeeTossAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const FrisbeeToss = /* @__PURE__ */ lazy(() => import("./FrisbeeToss.js").then((mod) => ({ default: mod.FrisbeeToss as unknown as React.ComponentType<unknown> })));
export const frisbeeTossSettings = {} as const;

type FTSettingsType = SettingsOf<typeof frisbeeTossSettings>;

export const frisbeeTossPlugin: GamePlugin<FrisbeeTossState, FrisbeeTossAction, typeof frisbeeTossSettings> = {
  id: "frisbee-toss",
  title: "Frisbee Toss",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Toss a frisbee into the target ring with perfect timing!",
  howToPlay: `Frisbee Toss is a timing and precision game played over eight rounds. A target ring is placed somewhere in the playing field, and you must toss your frisbee to land inside it.

At the bottom of the screen, an aim cursor sweeps left and right at a steady pace. The cursor represents where your frisbee will be released from — left means it goes left, right means it goes right. Watch the cursor's position relative to the target ring and release your toss when the cursor lines up with the ring's horizontal position.

Press Space or click Toss to release the frisbee. It arcs across the field toward the target area. The closer your release position aligns horizontally with the target ring, the higher your points for that round — a perfect alignment earns up to 100 points.

The sweep speed changes slightly each round, so stay focused and adjust your timing accordingly. You cannot steer the frisbee mid-flight, so your entire score depends on the moment of release.

Tips: Watch a full sweep or two before throwing to learn the speed. Try to release just slightly before the cursor reaches the target, since your perception and reaction add a small delay. Rounds with closer targets are easier but reward the same maximum score — treat every round as a fresh challenge.`,
  settings: frisbeeTossSettings,
  initialState: (seed: number, _settings: FTSettingsType) => initialState(seed),
  reducer,
  isTerminal,
    hint: (state: FrisbeeTossState) => {
      if (state.phase === "gameover") return null;
      return { selector: '[data-testid="hint-target-frisbee-toss-action"]', pulses: 3 };
    },
  component: FrisbeeToss,
};
