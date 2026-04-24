import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { FoxGeeseState, FoxGeeseAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { FoxAndGeese } from "./Game.js";

export const foxGeeseSettings = {
  opponent: {
    kind: "enum" as const,
    label: "Opponent",
    options: ["bot"] as const,
    default: "bot",
  },
} as const;

type FoxGeeseSettingsType = SettingsOf<typeof foxGeeseSettings>;

export const foxAndGeesePlugin: GamePlugin<FoxGeeseState, FoxGeeseAction, typeof foxGeeseSettings> = {
  id: "fox-and-geese",
  title: "Fox and Geese",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Classic asymmetric hunt game — one fox vs a flock of geese.",
  howToPlay: `Fox and Geese is a classic medieval hunt game played on a plus-shaped board. You control the lone Fox; the bot controls 13 Geese. The game is deeply asymmetric: the Fox is outnumbered but powerful.

The Fox wins by capturing all the Geese. A capture is made by jumping over an adjacent Goose to the empty square immediately beyond, exactly like in draughts. The Fox can move in all eight directions (orthogonal and diagonal). The Fox may make multiple successive captures in one turn if opportunities arise after each jump.

The Geese win by surrounding the Fox so it has no legal move. Geese move one step forward or sideways — never backward — so they can gradually corral the Fox toward a corner.

Click the Fox to select it; highlighted cells show legal moves. The bot moves the Geese randomly, so aggressive Fox play — capturing rapidly before the Geese can form a wall — is a strong strategy. Letting the Geese consolidate in the upper half will make it impossible to escape.

Scoring: Fox wins = 20; Geese win = 0.`,
  settings: foxGeeseSettings,
  initialState: (seed: number, settings: FoxGeeseSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: FoxAndGeese,
};
