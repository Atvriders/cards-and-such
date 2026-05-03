import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { KitchenChaosState, KitchenChaosAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { KitchenChaosGame } from "./Game.js";

export const kitchenChaosSettings = {
  difficulty: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "normal", "hard"] as const,
    default: "normal" as const,
  },
} as const;

type KitchenChaosSettingsType = SettingsOf<typeof kitchenChaosSettings>;

export const kitchenChaosPlugin: GamePlugin<KitchenChaosState, KitchenChaosAction, typeof kitchenChaosSettings> = {
  id: "kitchen-chaos",
  title: "Kitchen Chaos",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Assemble food orders from five ingredients before the timer runs out. Complete orders correctly for maximum points.",
  howToPlay: `Kitchen Chaos puts you behind a frantic kitchen counter. Two orders arrive at once, each showing a sequence of ingredients you need to stack in the correct order — think sandwiches and burgers built from bread, meat, cheese, lettuce, and tomatoes.

Click an order ticket to select it, then press the ingredient buttons at the bottom to add ingredients one by one. When your assembly matches the recipe, hit Serve to send the dish out. A correct serve scores time-based points: the more time remaining on the order, the higher the payout.

Watch the countdown on each order — when it hits zero the order fails and a new one replaces it. Urgent orders pulse red when they are close to expiring. It is sometimes better to abandon a nearly-failed order and focus on one you can still complete in time.

Each failed serve (wrong ingredients or wrong order) scores nothing. Prioritize accuracy over speed: one correct serve is worth more than two rushed failures.

The game runs for a fixed number of seconds. Easy mode gives you 100 seconds and 20-second order timers. Normal gives 80 seconds and 15-second timers. Hard cuts you to 60 seconds with 10-second timers.

Tip: scan both orders first and find the simpler recipe (fewer ingredients). Starting there lets you earn quick points and focus on the complex order with the remaining time.`,
  settings: kitchenChaosSettings,
  initialState: (seed: number, settings: KitchenChaosSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-kitchen-chaos-action"]', pulses: 3 }; },
  component: KitchenChaosGame,
};
