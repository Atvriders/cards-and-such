import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { NumberlinkState, NumberlinkAction, NumberlinkSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Numberlink } from "./Numberlink.js";

export const numberlinkSettings = {
  difficulty: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "medium", "hard"] as const,
    default: "easy",
  },
} as const;

type NumberlinkSettingsType = SettingsOf<typeof numberlinkSettings>;

export const numberlinkPlugin: GamePlugin<NumberlinkState, NumberlinkAction, typeof numberlinkSettings> = {
  id: "numberlink",
  title: "Numberlink",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Connect matching numbers with paths that fill every cell without crossing.",
  howToPlay: `Numberlink (also called Arukone) is a path-drawing puzzle played on a grid. The grid contains pairs of matching numbers — each number appears exactly twice. Your goal is to connect each pair with a continuous path, and the paths must collectively fill every single cell in the grid without crossing each other.

Each path must travel only horizontally or vertically, not diagonally. Paths cannot branch or loop — they must be simple lines from one endpoint to its matching partner. A cell is occupied by exactly one path.

To play: select a color (number) from the palette at the bottom, then click cells to paint that path. Select Erase to remove individual cells. Use "Clear N" to erase an entire path.

Strategy: start with pairs that have very limited routing options — especially pairs near corners or edges. Avoid boxing in other pairs or cutting off needed corridors. Remember that the paths must fill the entire grid, so leaving dead-end empty zones is invalid. If you get stuck, clear a path and try a different route. The constraint that every cell must be filled is just as important as connecting the pairs — use it to deduce forced turns.`,
  settings: numberlinkSettings,
  initialState: (seed: number, settings: NumberlinkSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: Numberlink,
};
