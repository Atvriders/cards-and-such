import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { LeafBlowerState, LeafBlowerAction, LeafBlowerSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { LeafBlower } from "./Game.js";

const settings = {
  difficulty: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "normal", "hard"] as const,
    default: "normal" as const,
  },
} as const;

export const leafBlowerPlugin: GamePlugin<LeafBlowerState, LeafBlowerAction, typeof settings> = {
  id: "leaf-blower",
  title: "Leaf Blower",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Click falling leaves before they hit the ground. Build combos for bonus points. 60 seconds!",
  howToPlay: `Leaf Blower is a fast-paced clicking game played against a 60-second timer. Colorful autumn leaves — maple 🍁, autumn 🍂, fern 🌿, and more — drift down from the top of the screen. Your job is to click (or tap) each leaf before it hits the ground.

Each caught leaf earns points based on its size: small leaves are worth 10 points, medium leaves 20, and large leaves 30. But here's the twist — catching leaves consecutively without missing one builds your combo multiplier. Every three consecutive catches increases your point multiplier by 1. A combo of 3 gives double points, combo 6 gives triple, and so on. Missing a single leaf resets your combo to zero.

Missed leaves do not end the game — they just break your combo and are counted in the "Missed" tally at the bottom. The game always runs for exactly 60 seconds regardless of misses.

When the timer reaches zero, the game ends and your total score is recorded. Try to beat your personal best by focusing on combos rather than individual leaf values.

Difficulty settings control how fast the leaves fall and how frequently they spawn. Easy gives you time to react calmly; Normal is brisk; Hard rains down leaves at a furious pace. Higher difficulty means more chances to catch but also more chances to miss — and combos become crucial.`,
  settings,
  initialState: (seed: number, s: LeafBlowerSettings) => initialState(seed, s),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "done" || p === "gameover" || p === "ended" || p === "finished" || (s as any).gameOver || (s as any).won || (s as any).complete || (s as any).isComplete) return null; return { selector: ".lb-leaf", pulses: 3 }; },
  component: LeafBlower,
};
