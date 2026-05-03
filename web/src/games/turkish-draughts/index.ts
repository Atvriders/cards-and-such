import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TurkishDraughtsState, TurkishDraughtsAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TurkishDraughts } from "./Game.js";

export const turkishDraughtsSettings = {
  opponent: {
    kind: "enum" as const,
    label: "Opponent",
    options: ["bot"] as const,
    default: "bot",
  },
} as const;

type TurkishDraughtsSettingsType = SettingsOf<typeof turkishDraughtsSettings>;

export const turkishDraughtsPlugin: GamePlugin<TurkishDraughtsState, TurkishDraughtsAction, typeof turkishDraughtsSettings> = {
  id: "turkish-draughts",
  title: "Turkish Draughts",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Dama — orthogonal draughts on an 8×8 board.",
  howToPlay: `Turkish Draughts (also called Dama) is a popular draughts variant played throughout Turkey and the Middle East. The 8×8 board uses all 64 squares — pieces are not restricted to one colour. You play White (bottom two rows); the bot plays Black (top two rows).

Pieces move orthogonally — forward or sideways, never backward. To capture an opponent's piece, jump over it to the empty square directly beyond. Captures are mandatory and you must take the maximum number of pieces available in a single turn. A piece that reaches the opponent's back row is promoted to a King, shown as a crown symbol. Kings are flying kings that slide freely in all four orthogonal directions and may capture from any distance. After capturing with a King the piece may land anywhere in the direction of capture.

The game ends when one side has no pieces remaining or no legal move. Click a white piece to select it, then click a highlighted square to move.

Scoring: win = 20 points; loss = 0.`,
  settings: turkishDraughtsSettings,
  initialState: (seed: number, settings: TurkishDraughtsSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (): HintTarget | null => (typeof document !== "undefined" && document.querySelector(".turkdraughts-board")) ? { selector: ".turkdraughts-board", pulses: 3 } : null,
  component: TurkishDraughts,
};
