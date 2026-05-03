import type { GamePlugin } from "../../platform/game-plugin/types.js";
import { initialState, reducer, isTerminal, type DragonEggHatchState, type DragonEggHatchAction } from "./state.js";
import { DragonEggHatchGame } from "./Game.js";

const settings = {
  eggs: {
    kind: "enum" as const,
    label: "Eggs",
    options: ["3", "5", "7"] as const,
    default: "5" as const,
  },
} as const;

export const dragonEggHatchPlugin: GamePlugin<DragonEggHatchState, DragonEggHatchAction, typeof settings> = {
  id: "dragon-egg-hatch",
  title: "Dragon Egg Hatch",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Tap dragon eggs at exactly the right moment as they glow to hatch mighty dragons!",
  howToPlay: `Dragon Egg Hatch is a timing-based reflex game. A clutch of dragon eggs sits before you, each waiting to hatch. Each egg has its own hidden hatch window — a brief period when the egg glows golden.

Watch the eggs carefully. When an egg starts to glow with a ✨ shimmer, tap it quickly! The earlier you tap within the glow window, the higher your timing bonus. Tap too early (before the glow) and the egg cracks — the dragon inside is lost! Miss the window entirely and the egg goes cold.

Score as many points as possible by hatching all the eggs in the batch. Each egg has a base point value plus a timing bonus that scales with how quickly you tapped after the glow began.

Strategy: keep your eyes on all eggs simultaneously. The glow windows don't overlap, so watch for the next one to activate after you tap the current one. Quick reactions are rewarded heavily.

Settings: choose 3, 5, or 7 eggs per round. More eggs means more action and higher potential scores.`,
  settings,
  initialState,
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-dragon-egg-hatch-action"]', pulses: 3 }; },
  component: DragonEggHatchGame,
};
