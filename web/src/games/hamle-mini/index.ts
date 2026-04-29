import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { HamleMiniState, HamleMiniAction, HamleMiniSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { HamleMiniGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
export const hamleMiniPlugin: GamePlugin<HamleMiniState, HamleMiniAction, typeof settings> = {
  id: "hamle-mini",
  title: "Hamle Mini",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Move numbered pieces minimally until each rests adjacent to its value.",
  howToPlay: "Hamle (Turkish for \"move\") is a sliding puzzle where numbered pieces start scattered and you move them so each piece sits adjacent (orthogonally) to exactly its value many same-numbered pieces. Pieces slide in one of the four cardinal directions until they hit another piece or a wall.\n\nGoal: minimize total moves to reach the target arrangement. Each move counts as 1 regardless of distance traveled.\n\nIn this mini version each puzzle shows a small grid with starting piece positions. The prompt asks for the minimum number of moves to reach the goal (or asks a specific question like \"which piece moves first?\").\n\nSix puzzles per round, scoring 100 points each with a 10-point time bonus per remaining second. Wrong picks reveal the correct answer.\n\nHamle is a satisfying mover puzzle once you see the slide-until-blocked physics. Pieces don't stop at arbitrary positions — they slide all the way to a stopper. This constraint dramatically reduces the search space and makes minimum-move calculations tractable. Six small puzzles compress the genre's appeal into a quick session.",
  settings,
  initialState: (seed: number) => initialState(seed, { dummy: true } as HamleMiniSettings),
  reducer,
  isTerminal,
  component: HamleMiniGame,
};
