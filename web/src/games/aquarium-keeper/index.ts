import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { AquariumState, AquariumAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const AquariumKeeper = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.AquariumKeeper as unknown as React.ComponentType<unknown> })));
export const aquariumKeeperPlugin = {
  id: "aquarium-keeper",
  title: "Aquarium Keeper",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Maintain a thriving aquarium for 15 days. Clean water, feed fish, regulate temperature, and keep every species healthy!",
  howToPlay: `Aquarium Keeper puts you in charge of a freshwater tank filled with five species: Clownfish, Guppies, Angelfish, Tetras, and Bettas. Your goal is to keep them healthy for 15 days.

Every day, three environmental factors threaten your fish: water cleanliness, food level, and temperature. Water gets dirty as fish produce waste — the more fish, the faster it drops. Food depletes daily based on how many fish you have and their appetite. Temperature stays steady unless you adjust it.

Each species has an ideal temperature. Clownfish prefer 26°C, Bettas like 27°C, while Guppies and Tetras thrive at 24°C. Keeping temperature too far from a species' ideal damages its health each day.

Before clicking Next Day, choose your actions: Clean the water (+30%), add food (+20%), or nudge the temperature up or down by 1°. You earn score each day based on the total count of fish multiplied by their average health percentage.

If a fish's health drops below 20%, it risks dying. Lost fish reduce future scoring potential. Balance your daily actions wisely — sometimes feeding matters more than cleaning, depending on your fish count. Target a final score of 200+ for top marks!`,
  settings: {} as const,
  initialState: (seed: number) => initialState(seed),
  reducer: reducer as (state: AquariumState, action: AquariumAction) => AquariumState,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "done" || p === "gameover" || p === "ended" || p === "finished" || (s as any).gameOver || (s as any).won || (s as any).complete || (s as any).isComplete) return null; return { selector: ".aqk-btn", pulses: 3 }; },
  component: AquariumKeeper,
} as unknown as GamePlugin;
