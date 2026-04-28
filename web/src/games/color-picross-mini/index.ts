import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { ColorPicrossMiniState, ColorPicrossMiniAction, ColorPicrossMiniSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ColorPicrossMiniGame } from "./Game.js";

const settings = {
  puzzles: { kind: "enum" as const, label: "Puzzles", options: ["8"] as const, default: "8" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const colorPicrossMiniPlugin: GamePlugin<ColorPicrossMiniState, ColorPicrossMiniAction, typeof settings> = {
  id: "color-picross-mini",
  title: "Color Picross Mini",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: `Multi-color nonogram: pick which cell colour fits the row/column hints.`,
  howToPlay: `Color Picross (multi-colour nonogram) extends the classic Japanese picross puzzle by introducing two or more cell colours. Row and column clues now list runs of each colour; same-colour runs need a gap, but different-colour runs may be adjacent.

In this solo adaptation, each puzzle gives a small grid with row/column clues and asks which colour fits a specific marked cell. Pick from the candidate colours (or "blank").

Eight puzzles per session, 100 points each (800 max).

Tips: solve along axes with the most-constraining clues first. A row with clues "(2 red)(1 blue)" in a 4-cell width has only two arrangements; intersect those with column clues to lock down cells. Different-colour runs that touch don't need a gap — that's the signature constraint that makes Color Picross harder than monochrome. With practice you'll spot forced-fill patterns instantly.`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ColorPicrossMiniSettings),
  reducer,
  isTerminal,
  component: ColorPicrossMiniGame,
};
