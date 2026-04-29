import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { ConnectState, ConnectAction, ConnectSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ConnectGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const quartoClassicPlugin: GamePlugin<ConnectState, ConnectAction, typeof settings> = {
  id: "quarto-classic",
  title: "Quarto (Classic)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Place pieces with four shared attributes; line up four pieces sharing any one trait.",
  howToPlay: "Quarto is an abstract connect-line game where each piece has four binary attributes (tall/short, light/dark, square/round, solid/hollow). A four-in-a-row line wins if all four pieces share any single attribute. The twist is that on your turn, your opponent picks the piece you must place.\n\nThis simplified single-player edition keeps the 4×4 grid and the four-in-a-row goal but uses simple two-color stones rather than the full attribute set. Click any empty cell to place a stone. The CPU then places a random stone of its own color. The first to align four stones of one color in a row, column, or diagonal wins.\n\nThe board is rendered as a 4×4 grid. Your stones show red; the CPU's stones show blue.\n\nQuarto strategy in this simplified form mirrors connect-four-on-a-tiny-board: control the center, build double threats, and watch for diagonal wins which are the trickiest to spot. The CPU plays random legal moves, so careful play wins reliably. Win scores 100 plus a piece bonus; draw is 25.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ConnectSettings),
  reducer,
  isTerminal,
  component: ConnectGame,
};
