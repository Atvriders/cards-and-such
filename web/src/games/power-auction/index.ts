import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { PowerAuctionState, PowerAuctionAction, PowerAuctionSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PowerAuctionGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const powerAuctionPlugin: GamePlugin<PowerAuctionState, PowerAuctionAction, typeof settings> = {
  id: "power-auction",
  title: "Power Plant Auction",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Power plant auction and fuel purchasing card distillation.",
  howToPlay: "Power Plant Auction is a Power Grid card distillation across ten turns. You start with $250 cash, no Plant cards, and no Fuel upgrades. Each turn, pick one action: Buy a Plant for $45, Save your cash for 5% interest, Buy Fuel for $65, or Sell a Plant for $35-55.\n\nAfter your action, every Plant earns $9 in city power sales and every Fuel earns $13 in efficiency bonus. A grid flavor event reflects the auction market. Your final score is net worth — cash plus cost-basis value of plants and fuel. The Power Grid genre rewards careful auction timing and fuel selection. Watch the auction, bid smart, save the grid. The cities are powered up.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as PowerAuctionSettings),
  reducer,
  isTerminal,
  hint: (state: any) => {
    if (state.phase === "choosing") return { selector: '[data-testid="hint-target-power-auction-primary"]', pulses: 3 };
    if (state.phase === "resolved") return { selector: '[data-testid="hint-target-power-auction-next"]', pulses: 3 };
    return null;
  },
  component: PowerAuctionGame,
};
