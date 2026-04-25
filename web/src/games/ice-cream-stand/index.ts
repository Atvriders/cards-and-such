import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { IceCreamState, IceCreamAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { IceCreamStand } from "./Game.js";

export const iceCreamStandPlugin = {
  id: "ice-cream-stand",
  title: "Ice Cream Stand",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Run a summer ice cream stand for 20 days. Watch the weather, set flavors and prices, and scoop your way to profit!",
  howToPlay: `Ice Cream Stand is a sunny management game where you run a frozen treat business for 20 days.

Each morning you decide how many scoops of each flavor to prepare and what to charge. Five flavors are available: Vanilla, Chocolate, Strawberry, Mint, and Caramel. Each has a unique cost, demand level, and maximum price. Preparing more scoops than you sell wastes ingredient costs, so plan carefully.

Weather changes daily and dramatically affects demand. Hot sunny days bring a big rush of customers — prepare extra! Rainy days are slow, so stock conservatively to cut waste. You can see tomorrow's forecast to plan ahead.

Upgrade your toppings station (three levels, $40 each) for a 10% demand boost per level — worth investing in if business is booming.

Pricing strategy matters: price too high and customers skip your stand; too low and you leave money on the table. Find the sweet spot for each flavor based on how the weather and demand look each day.

Goal: finish 20 days with $800 in cash. Vanilla and Chocolate are reliable bestsellers. Caramel and Mint command premium prices but sell less — reserve them for hot days!`,
  settings: {} as const,
  initialState: (seed: number) => initialState(seed),
  reducer: reducer as (state: IceCreamState, action: IceCreamAction) => IceCreamState,
  isTerminal,
  component: IceCreamStand,
} as unknown as GamePlugin;
