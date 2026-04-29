import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { SuburbiaIncState, SuburbiaIncAction, SuburbiaIncSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SuburbiaIncGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const suburbiaIncPlugin: GamePlugin<SuburbiaIncState, SuburbiaIncAction, typeof settings> = {
  id: "suburbia-inc",
  title: "Suburbia Inc",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Suburb-building mini with corporate twist: 10 turns of Tiles and Bonuses.",
  howToPlay: "Suburbia Inc captures the corporate-expansion spirit of the Suburbia expansion in ten quick turns. You start with $200 cash, no Tiles, and no Bonuses. Each turn, pick one action: Buy a Tile for $40, Save your cash for 5% interest, Buy a Bonus card for $60, or Sell a Tile back for a roughly $30-50 payout. After your action, every Tile in your borough earns $8 from population growth and every Bonus earns $12 from reputation bumps. A suburb event flavors the turn. Your final score is your net worth — cash plus the cost-basis value of your tiles and bonuses. Tiles yield steady income but tie up capital, bonuses amplify your reputation income but cost more, and saving is slow. Aim for a balanced borough by turn 10 to top the leaderboards as the most successful suburban planner.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SuburbiaIncSettings),
  reducer,
  isTerminal,
  component: SuburbiaIncGame,
};
