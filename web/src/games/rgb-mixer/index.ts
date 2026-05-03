import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import { initialState, reducer, isTerminal, type RgbMixerState, type RgbMixerAction } from "./state.js";
const RgbMixer = /* @__PURE__ */ lazy(() => import("./RgbMixer.js").then((mod) => ({ default: mod.RgbMixer as unknown as React.ComponentType<unknown> })));
export const rgbMixerSettings = {
  rounds: { kind: "enum" as const, label: "Rounds", options: ["3", "5", "8"] as const, default: "3" as const },
} as const;

export const rgbMixerPlugin: GamePlugin<RgbMixerState, RgbMixerAction, typeof rgbMixerSettings> = {
  id: "rgb-mixer",
  title: "RGB Mixer",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Drag R, G, B sliders to match a target color as closely as possible.",
  howToPlay: `RGB Mixer challenges your color sense. Each round, a target color swatch is displayed on the left. Drag the Red, Green, and Blue sliders to mix your own color on the right. Try to match the target as closely as possible before locking in.

Colors are made from three channels: Red, Green, and Blue, each ranging from 0 (none) to 255 (full). Combining all three at full gives white. Setting all to zero gives black. Each round you start at the midpoint (128, 128, 128) — neutral grey — and work from there.

When you're satisfied with your mix, click Lock In to submit. The game reveals how far off you were (color distance) and awards points: a perfect match scores 1000, and each unit of distance reduces the score. Then click Next Round to continue.

Play 3, 5, or 8 rounds depending on settings. Your total score is the sum of all round scores.

Tips: look at the dominant hue first. Bright red means high R, low G and B. Orange is high R, medium G, zero B. Purple is high R and B, low G. Then fine-tune brightness by adjusting all channels up or down together. Practice builds color intuition quickly.`,
  settings: rgbMixerSettings,
  initialState,
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-rgb-mixer-action"]', pulses: 3 }; },
  component: RgbMixer,
};
