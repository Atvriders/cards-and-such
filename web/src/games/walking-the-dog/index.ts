import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { WalkingTheDogState, WalkingTheDogAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { WalkingTheDogGame } from "./Game.js";

export const walkingTheDogSettings = {
  length: {
    kind: "enum" as const,
    label: "Walk Length",
    options: ["short", "medium", "long"] as const,
    default: "medium" as const,
  },
} as const;

type WalkingTheDogSettingsType = SettingsOf<typeof walkingTheDogSettings>;

export const walkingTheDogPlugin: GamePlugin<WalkingTheDogState, WalkingTheDogAction, typeof walkingTheDogSettings> = {
  id: "walking-the-dog",
  title: "Walking the Dog",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Take your dog for a walk! Dodge hazards, collect treats, and keep the dog's energy up over the whole route.",
  howToPlay: `Walking the Dog is a quick decision-making arcade game. You and your dog are heading out for a walk. Each step of the way you get a preview of what lies ahead — a hazard like a puddle, a speeding bicycle, or a curious cat — or a clear path with a juicy treat waiting.

You have three actions each turn. Walk moves straight ahead through whatever is in front of you. On a clear path it earns you a treat and a small energy boost. Walking into a puddle or bike costs energy. Walk through a cat only loses a little energy.

Dodge sidesteps whatever is ahead. Dodging a real hazard costs a small amount of energy but saves you from the full hit. Dodging when the path is clear wastes energy — a poor use of the move.

Sniff lets your dog investigate a potential treat. On a clear path it earns two treats and boosts energy. Sniffing when a hazard is ahead distracts the dog and costs extra energy.

Your energy bar must stay above zero for the full walk. Reaching the end of the route with energy remaining wins the game. Score is calculated from treats collected times 50 plus remaining energy times 2.

Choose short (10 steps), medium (20 steps), or long (30 steps). Longer walks offer more treats but require careful energy management.`,
  settings: walkingTheDogSettings,
  initialState: (seed: number, settings: WalkingTheDogSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: WalkingTheDogGame,
};
