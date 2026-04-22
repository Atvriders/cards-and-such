import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { AtariGoState, AtariGoAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { AtariGo } from "./AtariGo.js";

export const atariGoSettings = {
  opponent: {
    kind: "enum" as const,
    label: "Opponent",
    options: ["bot", "hot-seat"] as const,
    default: "bot",
  },
} as const;

type AtariGoSettingsType = SettingsOf<typeof atariGoSettings>;

export const atariGoPlugin: GamePlugin<AtariGoState, AtariGoAction, typeof atariGoSettings> = {
  id: "atari-go",
  title: "Atari Go",
  category: "board",
  players: { min: 1, max: 2, multiplayer: false },
  description: "Capture Go: first to capture any opponent stone wins. Great Go introduction.",
  howToPlay: `Atari Go (also called Capture Go) is the simplest and most accessible variant of Go. The rules are identical to standard Go, but the win condition is radically different: the first player to capture any opponent stone wins immediately.

You play as Black on a 9×9 board. On each turn, place a stone on any empty intersection. A group of stones connected orthogonally that has no adjacent empty points (liberties) is captured and removed from the board. Suicide (placing a stone with no liberties that also fails to capture anything) is not permitted.

Since a single capture ends the game, both players must simultaneously try to set traps for the opponent while guarding their own vulnerable groups. Stones with only one liberty are said to be in atari — a warning that they are about to be captured.

Strategy tip: avoid placing isolated single stones early. Try to surround the opponent's stones while keeping your own groups connected and safe.

The bot searches three moves ahead, evaluating the total liberties of each side. A group with few liberties is in danger; try to reduce the bot's liberties while expanding your own.`,
  settings: atariGoSettings,
  initialState: (seed: number, settings: AtariGoSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: AtariGo,
};
