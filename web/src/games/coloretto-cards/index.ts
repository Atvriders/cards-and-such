import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { ColorettoCardsState, ColorettoCardsAction, ColorettoCardsSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ColorettoCardsGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const colorettoCardsPlugin: GamePlugin<ColorettoCardsState, ColorettoCardsAction, typeof settings> = {
  id: "coloretto-cards",
  title: "Coloretto",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Card colour set collection — fewer colours score better.",
  howToPlay: "Coloretto condenses the card-colour set collection into ten quick turns. You begin with $200 cash, no Colour cards, and no Bonus tokens. Each turn, pick one action: Buy a Colour Card for $30, Save your cash for 5% interest, Buy a Bonus Token for $50, or Sell a Colour for $25-45 reward.\n\nAfter your action, every Colour Card earns $6 from set bonuses and every Bonus Token earns $10 from special endgame scoring. A flavor event reflects card-row choices. Your final score is net worth — cash plus the cost-basis value of colour cards and tokens. The trick of Coloretto is that fewer distinct colours score better; the distillation rewards specialization. Pick a palette and commit.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ColorettoCardsSettings),
  reducer,
  isTerminal,
  component: ColorettoCardsGame,
};
