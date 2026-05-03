import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ColorMatchState, ColorMatchAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const ColorMatchDash = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.ColorMatchDash as unknown as React.ComponentType<unknown> })));
const colorMatchSettings = {
  speed: {
    kind: "enum" as const,
    label: "Speed",
    options: ["slow", "normal", "fast"] as const,
    default: "normal" as const,
  },
} as const;

type ColorMatchSettingsType = SettingsOf<typeof colorMatchSettings>;

export const colorMatchDashPlugin: GamePlugin<ColorMatchState, ColorMatchAction, typeof colorMatchSettings> = {
  id: "color-match-dash",
  title: "Color Match Dash",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Match falling colored blocks to the correct button before they hit the bottom.",
  howToPlay: `Colored blocks fall from the top in four lanes. Each lane corresponds to a color: Red, Green, Blue, and Yellow. Your goal is to press the matching button just before the block reaches the hit zone at the bottom.

Press A for Red, S for Green, D for Blue, and F for Yellow — or tap the on-screen buttons. If a block reaches the bottom without being matched, you lose a life. You start with five lives.

Timing is everything. Press the button when the block is near or inside the white hit zone line near the bottom of the screen. Pressing too early does nothing. Pressing the wrong color when another color is in the zone costs you a life.

As you score more points the pace remains constant per difficulty — choose Fast to start immediately challenged. Each correct hit scores 10 points. There is no level cap; survive as long as possible to maximize your score.

Tips: Focus on the hit zone, not the falling blocks higher up. Keep your fingers hovering over A, S, D, F. When multiple blocks arrive at once, hit them in order from left lane to right. Don't panic and mash random keys — every wrong press in the zone costs a life.`,
  settings: colorMatchSettings,
  initialState: (seed: number, settings: ColorMatchSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any)?.phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any)?.gameOver === true || (s as any)?.done === true) return null; return { selector: ".cmd-button", pulses: 3 }; },
  component: ColorMatchDash,
};
