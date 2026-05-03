import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { WhackVirusState, WhackVirusAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const WhackAVirus = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.WhackAVirus as unknown as React.ComponentType<unknown> })));
const whackVirusSettings = {
  slots: {
    kind: "enum" as const,
    label: "Grid size",
    options: ["9", "16"] as const,
    default: "9" as const,
  },
  speed: {
    kind: "enum" as const,
    label: "Speed",
    options: ["normal", "fast"] as const,
    default: "normal" as const,
  },
} as const;

type WhackVirusSettingsType = SettingsOf<typeof whackVirusSettings>;

export const whackAVirusPlugin: GamePlugin<WhackVirusState, WhackVirusAction, typeof whackVirusSettings> = {
  id: "whack-a-virus",
  title: "Whack-a-Virus",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Tap viruses as they pop up before their timer expires — miss too many and it's game over.",
  howToPlay: `Viruses pop up in random slots of a grid. Click or tap each virus before its timer bar drains to zero. Letting a virus escape costs you one life — run out of five lives and the game ends. The game also ends after 60 seconds.

Three types of viruses appear. Normal green viruses (10 points) linger for about 1.8 seconds. Fast orange viruses (15 points) disappear after only 1 second, so you need to be quick. Rare blue bonus viruses (30 points) stay for 2.5 seconds, giving you time to focus on them.

The timer bar under each virus shows how long it will stay. When the bar turns orange or red, act fast. Each whacked virus pops with a satisfying animation.

Choose 9 slots for a more focused game where viruses are easier to track. Choose 16 slots for chaos with more targets spread across the grid. Fast mode spawns viruses more frequently.

Tips: Don't fixate on one virus — scan the whole grid quickly. Prioritize fast orange viruses over bonus ones since they disappear first. As the game progresses you will need to manage multiple viruses simultaneously. It helps to move your mouse toward the center of the grid so no virus is far from your cursor.`,
  settings: whackVirusSettings,
  initialState: (seed: number, settings: WhackVirusSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-whack-a-virus-action"]', pulses: 3 }; },
  component: WhackAVirus,
};
