import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { MarketBlufferState, MarketBlufferAction, MarketBlufferSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MarketBlufferGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const marketBlufferPlugin: GamePlugin<MarketBlufferState, MarketBlufferAction, typeof settings> = {
  id: "market-bluffer",
  title: "Market Bluffer",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Card economic bluffing — borrow to pay old investors.",
  howToPlay: "Market Bluffer is a card-economic bluffing distillation across ten turns. You start with $220 cash, no Investment cards, and no Trust upgrades. Each turn, pick one action: Buy an Investment for $40, Save your cash for 5% interest, Buy a Trust Upgrade for $60, or Sell an Investment for $30-50.\n\nAfter your action, every Investment earns $8 in returns and every Trust earns $12 in old-investor confidence. A flavor event reflects rumor and panic. Your final score is net worth — cash plus cost-basis value of investments and trusts. The Ponzi genre rewards bluffing your way to liquidity — borrow now, hope the market lasts. Just don't be the one holding the bag when the bell rings.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as MarketBlufferSettings),
  reducer,
  isTerminal,
  component: MarketBlufferGame,
};
