import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { PetShopState, PetAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PetShopMini } from "./Game.js";

export const petShopMiniPlugin = {
  id: "pet-shop-mini",
  title: "Pet Shop Mini",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Run a cozy pet shop for 20 days. Manage stock, set prices, keep pets happy, and grow your savings!",
  howToPlay: `Pet Shop Mini puts you in charge of a small animal shop for 20 days. Each morning, prepare your shop before opening the doors.

You stock five types of animals: Puppies, Kittens, Bunnies, Parrots, and Hamsters. Each has a purchase cost, base demand, and maximum sale price. Stock up by buying more animals (cash spent immediately). Set sale prices wisely — too high and customers walk away, too low and you lose margin.

Pet happiness matters! Happy pets attract more customers. Spend $2 per 10 happiness points to keep them content. Happiness drops by 5 each day whether you spend or not, so budget for pet care daily.

Advertising boosts demand across the board. Spend up to $50 per day on ads; higher budgets bring more foot traffic.

After opening, you'll see how many of each pet sold and your daily profit. Profit equals revenue minus purchase costs and ad spending.

Goal: accumulate $1000 cash by day 20. Watch your margins on each animal and reinvest wisely. Puppies and kittens command premium prices but cost more. Hamsters sell steadily at low cost — good for cash flow early on!`,
  settings: {} as const,
  initialState: (seed: number) => initialState(seed),
  reducer: reducer as (state: PetShopState, action: PetAction) => PetShopState,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "done" || p === "gameover" || p === "ended" || p === "finished" || (s as any).gameOver || (s as any).won || (s as any).complete || (s as any).isComplete) return null; return { selector: ".psm-btn-sm", pulses: 3 }; },
  component: PetShopMini,
} as unknown as GamePlugin;
