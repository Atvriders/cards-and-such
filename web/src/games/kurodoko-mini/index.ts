import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { KurodokoMiniState, KurodokoMiniAction, KurodokoMiniSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { KurodokoMiniGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
export const kurodokoMiniPlugin: GamePlugin<KurodokoMiniState, KurodokoMiniAction, typeof settings> = {
  id: "kurodoko-mini",
  title: "Kurodoko Mini",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Place black cells; numbers count visible white cells in their rays.",
  howToPlay: "Kurodoko (\"Where is Black?\") is a Japanese shading puzzle. White cells contain numbers indicating the count of visible white cells in the four cardinal directions (up, down, left, right) including the cell itself, until a black cell or wall blocks the line of sight.\n\nRule constraints: black cells cannot be orthogonally adjacent to other black cells; all white cells must remain connected through orthogonal adjacency; numbered cells must remain white.\n\nIn this mini version each puzzle shows a small grid with given numbers and partial blacks. The prompt asks where one specific black cell must go to satisfy the constraints.\n\nSix puzzles per round, scoring 100 points each with a 10-point time bonus per remaining second. Wrong picks reveal the correct cell. Kurodoko's tight rules make every puzzle have a unique solution — start from the largest numbers (which need long unobstructed rays) and the smallest (which need close walls). After a few puzzles you'll recognize the patterns instantly.",
  settings,
  initialState: (seed: number) => initialState(seed, { dummy: true } as KurodokoMiniSettings),
  reducer,
  isTerminal,
  component: KurodokoMiniGame,
};
