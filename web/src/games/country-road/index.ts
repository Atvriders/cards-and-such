import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CountryRoadState, CountryRoadAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CountryRoad } from "./CountryRoad.js";

const countryRoadSettings = {
  difficulty: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "hard"] as const,
    default: "easy",
  },
} as const;

type S = SettingsOf<typeof countryRoadSettings>;

export const countryRoadPlugin: GamePlugin<CountryRoadState, CountryRoadAction, typeof countryRoadSettings> = {
  id: "country-road",
  title: "Country Road",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Trace a loop through coloured regions; each number tells how many cells of its region the road visits.",
  howToPlay: `Country Road is a Japanese loop-tracing puzzle. The grid is divided into coloured regions, and each region contains a number. Your task is to trace a single closed loop that passes through cells — orthogonally connected, one cell at a time — obeying these rules.

First, the loop must visit exactly as many cells in each region as that region's number indicates. If a region's number is 3, exactly three of its cells must be on the road.

Second, any cell in a region that is NOT on the road cannot be orthogonally adjacent to another non-road cell in the same region. In other words, non-road cells within a region must be isolated from each other (no two non-road cells of the same region may share an edge).

Click a cell to toggle it as part of the road (shown in green). The number shown in the top-left cell of each region is the region's required visit count. Use region sizes and the no-adjacent-skipped rule together to uniquely determine the road's path.

Click Reset to start over.`,
  settings: countryRoadSettings,
  initialState: (seed: number, settings: S) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: CountryRoad,
};
