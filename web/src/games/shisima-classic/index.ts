import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { ConnectState, ConnectAction, ConnectSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ConnectGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const shisimaClassicPlugin: GamePlugin<ConnectState, ConnectAction, typeof settings> = {
  id: "shisima-classic",
  title: "Shisima (Classic)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Kenyan octagon three-in-a-row; place three stones to win.",
  howToPlay: "Shisima is a traditional Kenyan three-in-a-row game played on an eight-pointed star or octagon. Each player has three stones; the first to align them on a connected row through the center wins. This Classic edition uses a 3×3 grid representation that captures the connectivity and play feel.\n\nYou play first against a random CPU. Click any empty cell to place a stone. The CPU plays a random legal move. The first to align three stones in a row, column, or diagonal wins.\n\nThe board is rendered as a 3×3 grid; the central cell corresponds to the octagon's center, which participates in every winning line on the original board.\n\nShisima's central cell is dominant: take it on your first move whenever possible. The CPU plays random legal moves, so a center-and-corner opening reliably converts. A win scores 100 plus a per-piece bonus; a draw scores 25; a loss scores zero. With only nine cells the game finishes in a few seconds, so play several rounds to chase a high score.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ConnectSettings),
  reducer,
  isTerminal,
  hint: (state) => state.phase === "playing" && state.turn === "P" ? { selector: ".cn-cell:not(.p):not(.c)", pulses: 3 } : null,
  component: ConnectGame,
};
