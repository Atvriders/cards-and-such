import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { MahjongState, MahjongAction } from "../_shared/mahjongEngine.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MahjongLanternGlowGame } from "./Game.js";

const settings = {} as const;

export const mahjongLanternGlowPlugin: GamePlugin<MahjongState, MahjongAction, typeof settings> = {
  id: "mahjong-lantern-glow",
  title: "Mahjong Lantern Glow",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Mahjong solitaire on a glowing paper lantern with cap, body, and tassel.",
  howToPlay: "Mahjong Lantern Glow is a Mahjong solitaire layout depicting a Japanese paper lantern, with a small cap on top, a wide central body of five-by-five tiles, a narrow tassel hanging beneath, and a layered glow inside the lantern that rises two extra layers in the centre. The inner glow stack provides the puzzle's main vertical challenge.\n\nClick any free tile (no tile on top, at least one open same-layer side) to highlight it, then click another free tile bearing the same face to clear the pair. Mismatches transfer your highlight to the new tile rather than losing it.\n\nPeel the inner glow stack from the top to expose the central body tiles beneath. The cap and tassel are small and remain mostly free throughout the game. A perfect clear scores up to ten thousand points minus fifty per move played; deadlocks end the run with proportional credit for the tiles removed before the puzzle locks.",
  settings,
  initialState: (seed: number) => initialState(seed),
  reducer,
  isTerminal,
  component: MahjongLanternGlowGame,
};
