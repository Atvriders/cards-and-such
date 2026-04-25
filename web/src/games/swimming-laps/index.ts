import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SwimState, SwimAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SwimmingLaps } from "./Game.js";

export const swimmingLapsPlugin = {
  id: "swimming-laps",
  title: "Swimming Laps",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Alternate left and right strokes to power through 5 laps. Switch lanes to dodge obstacles and maintain your combo for max speed!",
  howToPlay: `Swimming Laps is a rhythm-based arcade game where you race through a three-lane pool over 5 laps.

Your swimmer moves forward automatically, but you control speed and direction. Alternate between the L Stroke and R Stroke buttons — every correct alternation adds to your combo multiplier and boosts speed. Pressing the same button twice in a row breaks your combo and slows you down.

Three lanes run parallel through the pool. Obstacles appear in random lanes; use the Lane buttons to dodge left or right before they reach you. Each obstacle hit costs 20 points, so stay alert and switch lanes early.

Stamina matters: every stroke costs stamina. When stamina drops below 50%, your effective speed reduces. Stamina slowly recovers between strokes, so don't mash buttons — find a rhythm that keeps stamina healthy.

Complete each lap (progress bar reaches 100%) to earn a 50-point lap bonus. Finishing all 5 laps before time runs out scores well.

Your final score combines lap bonuses, combo consistency, and obstacle avoidance. Score 200+ for a gold medal! Tips: butterfly stroke is fastest but burns stamina quickest; breaststroke is slower but conserves energy — choose based on your playstyle.`,
  settings: {} as const,
  initialState: (seed: number) => initialState(seed),
  reducer: reducer as (state: SwimState, action: SwimAction) => SwimState,
  isTerminal,
  component: SwimmingLaps,
} as unknown as GamePlugin;
