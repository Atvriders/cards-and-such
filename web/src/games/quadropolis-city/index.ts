import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { QuadropolisCityState, QuadropolisCityAction, QuadropolisCitySettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { QuadropolisCityGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const quadropolisCityPlugin: GamePlugin<QuadropolisCityState, QuadropolisCityAction, typeof settings> = {
  id: "quadropolis-city",
  title: "Quadropolis",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "City-building tile draft with skyscraper, park, tower, factory, and mall tiles.",
  howToPlay: "Quadropolis is a city-building game with skyscraper height restrictions. In this adaptation you place 16 building tiles on a 5x5 city grid. Tile types are: skyscraper, park, tower, factory, and mall. Click any empty cell to place the next tile from the queue. Each placement scores 1 base point plus 1 per orthogonally adjacent same-type building. Strategy: zone your city by clustering similar buildings together. Parks naturally cluster as green spaces, while skyscrapers and towers form business districts. With five types over 16 tiles you'll average just over three of each, allowing two strong clusters per type. After all placements the city is finalised. A solid Quadropolis score is 28-36 points; an exceptional zoner reaches 42+. Random tile queues mean every city has a unique zoning challenge to solve.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as QuadropolisCitySettings),
  reducer,
  isTerminal,
  component: QuadropolisCityGame,
};
