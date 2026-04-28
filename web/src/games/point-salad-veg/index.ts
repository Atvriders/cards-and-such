import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { PointSaladVegState, PointSaladVegAction, PointSaladVegSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PointSaladVegGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const pointSaladVegPlugin: GamePlugin<PointSaladVegState, PointSaladVegAction, typeof settings> = {
  id: "point-salad-veg",
  title: "Point Salad",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Draft vegetable cards. Half score conditions, half vegetables.",
  howToPlay: "Point Salad is a card-drafting set-collection game built around the rule that every card is both a vegetable AND a scoring condition. Each round, three offers appear and you pick one; the CPU takes the highest-rank remaining. Eight rounds total. Cards represent four vegetable kinds: sun-tomatoes, moon-cabbage, star-onions, leaf-lettuce. Score combines suits (vegetable types) and ranks (scoring conditions): three same-veg earn +10, five same-veg earn another +15, two same-rank earn +5, three-same-rank earn +10. Raw ranks sum too. Final score equals tableau plus +25 bonus if you beat the CPU. Strategy: in the original, you'd pivot between scoring-card and vegetable-card. Here it's pure tableau-building. Lock a vegetable type early, then chase high-rank cards in mid-late game once your suit bonus is secure. Targets: 70-110 with bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as PointSaladVegSettings),
  reducer,
  isTerminal,
  component: PointSaladVegGame,
};
