import type { GamePlugin } from "../../platform/game-plugin/types.js";
import { initialState, reducer, isTerminal, type PizzaRushState, type PizzaRushAction } from "./state.js";
import { PizzaRushGame } from "./Game.js";

const settings = {
  speed: {
    kind: "enum" as const,
    label: "Speed",
    options: ["slow", "normal", "fast"] as const,
    default: "normal" as const,
  },
} as const;

export const pizzaRushPlugin: GamePlugin<PizzaRushState, PizzaRushAction, typeof settings> = {
  id: "pizza-rush",
  title: "Pizza Rush",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Build pizzas fast — match orders before the timer runs out!",
  howToPlay: `Pizza Rush is a fast-paced pizza assembly game. Orders appear on screen, each showing exactly which toppings are needed. Your job: add those toppings to your pizza and submit before time runs out!

Use the topping buttons at the bottom to load up your pizza. Toppings available are Sauce, Cheese, Pepperoni, Mushroom, and Olive. Once your pizza matches the order, press Submit. The faster you complete an order, the bigger your speed bonus — so hustle!

If you add wrong toppings, press Clear to wipe the pizza clean and start over. Orders have a countdown timer shown as a shrinking red bar — if a timer hits zero the order fails and you lose points.

New orders appear automatically as you work. You can have up to three active orders at once. The game runs for 60 seconds. Maximize your score by completing orders quickly and minimizing failures.

On Slow speed timers are generous; on Fast speed every second counts!`,
  settings,
  initialState,
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-pizza-rush-action"]', pulses: 3 }; },
  component: PizzaRushGame,
};
