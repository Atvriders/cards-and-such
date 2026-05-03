import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MagicWandCastState, MagicWandCastAction, MagicWandCastSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const MagicWandCast = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.MagicWandCast as unknown as React.ComponentType<unknown> })));
const settings = {
  spells: { kind: "enum" as const, label: "Spells", options: ["5", "8", "12"] as const, default: "8" as const },
} as const;

type S = SettingsOf<typeof settings>;

export const magicWandCastPlugin: GamePlugin<MagicWandCastState, MagicWandCastAction, typeof settings> = {
  id: "magic-wand-cast",
  title: "Magic Wand Cast",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Follow the color sequence to cast each spell! Speed and accuracy earn bonus points.",
  howToPlay: `Magic Wand Cast is a color sequence memory and reaction game. Each round a spell is displayed as a sequence of colored orbs — red, blue, green, yellow, or purple.

Your task is to cast the spell by clicking the colored buttons in the exact order shown. The orbs in the spell display highlight as you progress. If you click the wrong color, your progress on that spell resets and you must start over from the first orb — but you keep your time!

Cast the full sequence correctly to complete the spell. Score is based on how many attempts it took and how much time remains: fewer mistakes and faster casting means more points.

Spells grow slightly longer as the game progresses (from 3 colors up to 5). Use Settings to choose 5, 8, or 12 spells per game.

The game ends after all spells are attempted. Can you cast every spell perfectly on the first try?`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as MagicWandCastSettings),
  reducer, isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-magic-wand-cast-action"]', pulses: 3 }; },
  component: MagicWandCast,
};
