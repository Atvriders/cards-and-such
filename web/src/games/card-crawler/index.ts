import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { CardCrawlerState, CardCrawlerAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const CardCrawler = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.CardCrawler as unknown as React.ComponentType<unknown> })));
export const cardCrawlerPlugin = {
  id: "card-crawler",
  title: "Card Crawler",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Flip a 4×4 grid of face-down cards to fight monsters, heal, and grab gold. Survive to clear the board!",
  howToPlay: `Card Crawler places 16 face-down cards in a 4×4 grid. Each card hides something: a weapon, a healing potion, gold, an enemy, or the fearsome Boss. Flip one card per turn by clicking it.

Sword/Axe/Dagger/Hammer/Spear cards are fight cards — they add points to your score. These represent weapons you find and use successfully.

Potion and Herb cards heal your HP. Manage your health carefully — HP lost to enemies cannot be recovered unless you find healing cards.

Coin and Chest cards give you gold, which is added to your final score when you clear the board.

Goblin, Rat, Orc, and Troll cards deal direct damage to your HP. The Boss card deals 30 damage — a very dangerous encounter!

Your goal is to flip all 16 cards without dying. If your HP reaches zero, the run ends immediately. Try to remember card positions if you replay — strategy matters!

Final score = fight points + gold collected. Good luck, crawler!`,
  settings: {} as const,
  initialState: (seed: number) => initialState(seed),
  reducer: reducer as (state: CardCrawlerState, action: CardCrawlerAction) => CardCrawlerState,
  isTerminal,
  hint: (state: CardCrawlerState) => isTerminal(state) ? null : { selector: '[data-testid="play-restart-btn"]', pulses: 3 },
  component: CardCrawler,
} as unknown as GamePlugin;
