import type { GamePlugin } from "../platform/game-plugin/types.js";
import { klondikePlugin } from "./klondike/index.js";
import { freecellPlugin } from "./freecell/index.js";
import { yahtzeePlugin } from "./yahtzee/index.js";
import { farklePlugin } from "./farkle/index.js";

export const GAMES: GamePlugin[] = [
  klondikePlugin as unknown as GamePlugin,
  freecellPlugin as unknown as GamePlugin,
  yahtzeePlugin as unknown as GamePlugin,
  farklePlugin as unknown as GamePlugin,
];
