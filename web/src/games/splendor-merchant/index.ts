import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { SplendorMerchantState, SplendorMerchantAction, SplendorMerchantSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SplendorMerchantGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const splendorMerchantPlugin: GamePlugin<SplendorMerchantState, SplendorMerchantAction, typeof settings> = {
  id: "splendor-merchant",
  title: "Splendor Merchant",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Gem token economy — buy cards fund expensive purchases.",
  howToPlay: "Splendor Merchant is a gem-token economy distillation across ten turns. You start with $200 cash, no Gem cards, and no Noble cards. Each turn, pick one action: Buy a Gem Card for $40, Save your cash for 5% interest, Court a Noble for $60, or Sell a Gem Card for $30-50.\n\nAfter your action, every Gem Card earns $8 in prestige and every Noble earns $12 in royal favor. A flavor event reflects the market. Your final score is net worth — cash plus cost-basis value of gem cards and nobles. The Splendor genre rewards efficient card chains where cheap cards fund expensive ones. Buy the cheap card. Buy the better card. Crown yourself with prestige.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SplendorMerchantSettings),
  reducer,
  isTerminal,
  component: SplendorMerchantGame,
};
