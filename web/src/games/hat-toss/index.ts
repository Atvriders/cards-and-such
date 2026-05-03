import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { HatTossState, HatTossAction, HatTossSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const HatToss = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.HatToss as unknown as React.ComponentType<unknown> })));
const hatTossPluginSettings = {
  duration: { kind: "enum" as const, label: "Duration (seconds)", options: ["20", "30", "45"] as const, default: "30" as const },
} as const;

type S = SettingsOf<typeof hatTossPluginSettings>;

export const hatTossPlugin: GamePlugin<HatTossState, HatTossAction, typeof hatTossPluginSettings> = {
  id: "hat-toss",
  title: "Hat Toss",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Hats are flying through the air! Catch them before they land on the ground — be the best hat catcher in town!",
  howToPlay: `Hat Toss is a stylish catching arcade game. Top hats are tossed from the top of the screen and arc downward at various positions. Click each hat to catch it before it hits the ground!

A standard hat earns 10 points. A double hat (two hats together, faster) is worth 20 points — catch those for a points bonus! Every hat that lands uncaught costs one life.

You start with 3 lives. Lose all three and the game ends. The timer also ends the game when it runs out.

New hats toss in every two seconds. Up to 6 can be in the air at once, so stay sharp!

Use Settings to choose 20, 30, or 45 seconds. Final score, hats caught, and hats missed are shown at the end. Can you catch every hat and stay perfectly stylish?`,
  settings: hatTossPluginSettings,
  initialState: (seed: number, s: S) => initialState(seed, s as HatTossSettings),
  reducer, isTerminal,
    hint: (state: HatTossState) => {
      if (state.phase === "gameover") return null;
      return { selector: '[data-testid="hint-target-hat-toss-action"]', pulses: 3 };
    },
  component: HatToss,
};
