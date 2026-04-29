import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { CountryRoadMiniState, CountryRoadMiniAction, CountryRoadMiniSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CountryRoadMiniGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
export const countryRoadMiniPlugin: GamePlugin<CountryRoadMiniState, CountryRoadMiniAction, typeof settings> = {
  id: "country-road-mini",
  title: "Country Road Mini",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Draw a single loop visiting each region exactly once.",
  howToPlay: "Country Road is a Nikoli loop puzzle where the grid is divided into regions and you draw a single closed loop that visits each region exactly once. The loop runs along grid edges connecting cell centers; it never crosses itself.\n\nKey rules: enter a region exactly once; if a region has a clue number, the loop must occupy exactly that many cells inside the region; cells with no loop must be in the same region as their orthogonally adjacent unfilled cells.\n\nIn this mini version each puzzle shows a small grid with regions outlined and partial loop drawn. The prompt asks which cell the loop visits next, or which region constraint is satisfied.\n\nSix puzzles per round, scoring 100 points each with a 10-point time bonus per remaining second. Wrong picks reveal the right cell.\n\nCountry Road's challenge is balancing the \"visit each region once\" rule with the cell-count clues. Spotting the unique entry/exit points of each region usually breaks the puzzle open. Once you draw the first few segments, the rest cascades through clean deductive logic.",
  settings,
  initialState: (seed: number) => initialState(seed, { dummy: true } as CountryRoadMiniSettings),
  reducer,
  isTerminal,
  component: CountryRoadMiniGame,
};
